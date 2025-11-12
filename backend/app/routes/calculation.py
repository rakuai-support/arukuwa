"""
Calculation Routes
"""
from flask import Blueprint, jsonify, request
import uuid
from datetime import datetime

from app.extensions import db
from app.models import Calculation, CalculationYearlyData, Session
from app.services import LifePlanCalculator, get_gemini_service

calculation_bp = Blueprint("calculation", __name__)


@calculation_bp.route("/calculate", methods=["POST"])
def calculate():
    """
    ライフプラン計算

    Request Body:
        {
            "user_info": {
                "age": int,
                "monthly_expenses": int,
                "total_assets": int,
                "monthly_support": int (optional),
                "support_type": str (optional)
            },
            "options": {
                "use_ai_analysis": bool (optional),
                "simulation_years": int (optional)
            }
        }

    Returns:
        計算結果のJSON
    """
    try:
        data = request.get_json()

        if not data or "user_info" not in data:
            return jsonify({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "user_infoが必要です"
                }
            }), 400

        user_info = data["user_info"]
        options = data.get("options", {})

        # 入力値の検証
        required_fields = ["age", "monthly_expenses", "total_assets"]
        for field in required_fields:
            if field not in user_info:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": f"{field}が必要です"
                    }
                }), 400

        # バリデーション
        age = user_info["age"]
        monthly_expenses = user_info["monthly_expenses"]
        total_assets = user_info["total_assets"]
        monthly_support = user_info.get("monthly_support", 0)

        if not (0 <= age <= 120):
            return jsonify({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "年齢は0から120の間で入力してください"
                }
            }), 400

        if monthly_expenses < 0:
            return jsonify({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "生活費は0以上で入力してください"
                }
            }), 400

        if total_assets < 0:
            return jsonify({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "資産は0以上で入力してください"
                }
            }), 400

        # 計算実行
        simulation_years = options.get("simulation_years", 50)
        calculator = LifePlanCalculator(
            age=age,
            monthly_expenses=monthly_expenses,
            total_assets=total_assets,
            monthly_support=monthly_support,
        )

        result = calculator.calculate(simulation_years=simulation_years)

        # AI分析（Gemini API使用）
        use_ai = options.get("use_ai_analysis", True)

        if use_ai:
            gemini_service = get_gemini_service()
            ai_analysis_result = gemini_service.analyze_life_plan(user_info, result)
            ai_analysis = {
                "risk_factors": ai_analysis_result.get("risk_factors", []),
                "suggestions": ai_analysis_result.get("suggestions", []),
                "advice_message": ai_analysis_result.get("advice_message", ""),
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "model_version": "gemini" if gemini_service.enabled else "fallback",
            }
        else:
            # Fallback to simple analysis
            ai_analysis = {
                "risk_factors": calculator.get_risk_factors(result),
                "suggestions": calculator.get_suggestions(result),
                "advice_message": calculator.generate_advice_message(result),
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "model_version": "simple_calculator_v1",
            }

        # 計算結果をデータベースに保存
        calculation_id = f"calc_{uuid.uuid4().hex[:16]}"

        # セッションIDの取得（オプション）
        session_id = data.get("session_id")

        calculation = Calculation(
            calculation_id=calculation_id,
            session_id=session_id if session_id else "anonymous",
            input_data=user_info,
            result_data=result,
            ai_analysis=ai_analysis,
        )

        db.session.add(calculation)

        # 年次データを保存
        for yearly in result["yearly_data"]:
            yearly_record = CalculationYearlyData(
                calculation_id=calculation_id,
                year=yearly["year"],
                age=yearly["age"],
                balance=yearly["balance"],
                annual_income=yearly["annual_income"],
                annual_expenses=yearly["annual_expenses"],
                net_change=yearly["net_change"],
            )
            db.session.add(yearly_record)

        db.session.commit()

        # レスポンスの作成
        response_data = {
            "calculation_id": calculation_id,
            "created_at": calculation.created_at.isoformat() + "Z",
            "input": user_info,
            "result": {
                "depletion_age": result.get("depletion_age"),
                "depletion_year": result.get("depletion_year"),
                "years_until_depletion": result.get("years_until_depletion"),
                "total_years_simulated": result["total_years_simulated"],
                "yearly_data": result["yearly_data"],
                "summary": result["summary"],
                "ai_analysis": ai_analysis,
            },
        }

        return jsonify({
            "success": True,
            "data": response_data
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Calculation error: {str(e)}")  # ログ出力
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "計算中にエラーが発生しました"
            }
        }), 500


@calculation_bp.route("/calculate/<calculation_id>", methods=["GET"])
def get_calculation(calculation_id):
    """
    計算結果を取得

    Args:
        calculation_id: 計算ID

    Returns:
        計算結果のJSON
    """
    try:
        calculation = Calculation.query.filter_by(
            calculation_id=calculation_id
        ).first()

        if not calculation:
            return jsonify({
                "success": False,
                "error": {
                    "code": "CALCULATION_NOT_FOUND",
                    "message": "計算結果が見つかりません"
                }
            }), 404

        response_data = {
            "calculation_id": calculation.calculation_id,
            "created_at": calculation.created_at.isoformat() + "Z",
            "input": calculation.input_data,
            "result": {
                **calculation.result_data,
                "ai_analysis": calculation.ai_analysis,
            },
        }

        return jsonify({
            "success": True,
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Get calculation error: {str(e)}")
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "計算結果の取得に失敗しました"
            }
        }), 500
