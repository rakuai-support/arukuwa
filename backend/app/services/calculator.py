"""
Life Plan Calculation Service
"""
from datetime import datetime
from typing import Dict, List, Optional


class LifePlanCalculator:
    """ライフプラン計算サービス"""

    def __init__(
        self,
        age: int,
        monthly_expenses: int,
        total_assets: int,
        monthly_support: int = 0,
    ):
        """
        Args:
            age: 現在の年齢
            monthly_expenses: 月間生活費
            total_assets: 総資産
            monthly_support: 月間受給額（公的支援）
        """
        self.current_age = age
        self.monthly_expenses = monthly_expenses
        self.total_assets = total_assets
        self.monthly_support = monthly_support
        self.current_year = datetime.now().year

    def calculate(self, simulation_years: int = 50) -> Dict:
        """
        ライフプランを計算

        Args:
            simulation_years: シミュレーション年数

        Returns:
            計算結果の辞書
        """
        yearly_data = []
        balance = self.total_assets
        depletion_year = None
        depletion_age = None

        # 年次ごとに計算
        for year_offset in range(simulation_years):
            year = self.current_year + year_offset
            age = self.current_age + year_offset

            # 年間収支の計算
            annual_income = self.monthly_support * 12
            annual_expenses = self.monthly_expenses * 12
            net_change = annual_income - annual_expenses

            # 残高の更新
            balance += net_change

            # 年次データを記録
            yearly_data.append({
                "year": year,
                "age": age,
                "balance": max(0, balance),  # マイナスは0とする
                "annual_income": annual_income,
                "annual_expenses": annual_expenses,
                "net_change": net_change,
            })

            # 資金枯渇の検出
            if balance <= 0 and depletion_year is None:
                depletion_year = year
                depletion_age = age

            # 残高がマイナスの場合、それ以降はゼロのまま
            if balance <= 0:
                balance = 0

        # サマリーの計算
        total_income = sum(d["annual_income"] for d in yearly_data)
        total_expenses = sum(d["annual_expenses"] for d in yearly_data)
        net_balance = total_income - total_expenses

        # 平均月間残高の計算
        avg_monthly_balance = int(
            sum(d["balance"] for d in yearly_data) / len(yearly_data) / 12
        )

        # 資金枯渇までの年数
        years_until_depletion = None
        if depletion_year:
            years_until_depletion = depletion_year - self.current_year

        return {
            "depletion_age": depletion_age,
            "depletion_year": depletion_year,
            "years_until_depletion": years_until_depletion,
            "total_years_simulated": simulation_years,
            "yearly_data": yearly_data,
            "summary": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_balance": net_balance,
                "average_monthly_balance": avg_monthly_balance,
            },
        }

    def get_risk_factors(self, result: Dict) -> List[str]:
        """
        リスク要因を分析

        Args:
            result: 計算結果

        Returns:
            リスク要因のリスト
        """
        risks = []

        # 資金枯渇リスク
        if result["depletion_year"]:
            years = result["years_until_depletion"]
            risks.append(
                f"現在の支出ペースでは約{years}年後に資金が枯渇する可能性があります"
            )

        # 月間収支がマイナス
        monthly_balance = self.monthly_support - self.monthly_expenses
        if monthly_balance < 0:
            risks.append(
                f"月間収支が{abs(monthly_balance):,}円のマイナスです。毎月資産が減少しています"
            )

        # 公的支援がない
        if self.monthly_support == 0:
            risks.append(
                "公的支援を受けていない場合、利用可能な制度がないか確認することをお勧めします"
            )

        # 資産が少ない
        if self.total_assets < self.monthly_expenses * 12:
            risks.append(
                "現在の資産が年間生活費を下回っています。早急な対策が必要です"
            )

        return risks

    def get_suggestions(self, result: Dict) -> List[str]:
        """
        改善提案を生成

        Args:
            result: 計算結果

        Returns:
            改善提案のリスト
        """
        suggestions = []

        # 支出削減の提案
        monthly_balance = self.monthly_support - self.monthly_expenses
        if monthly_balance < 0:
            # 10%削減した場合の効果
            reduced_expenses = int(self.monthly_expenses * 0.9)
            monthly_saving = self.monthly_expenses - reduced_expenses

            # 削減による延命効果を計算
            if result["depletion_year"]:
                current_monthly_deficit = abs(monthly_balance)
                new_monthly_deficit = current_monthly_deficit - monthly_saving
                if new_monthly_deficit > 0:
                    current_months = int(
                        self.total_assets / current_monthly_deficit
                    )
                    new_months = int(self.total_assets / new_monthly_deficit)
                    extended_years = (new_months - current_months) / 12

                    suggestions.append(
                        f"月々の生活費を10%（{monthly_saving:,}円）削減することで、"
                        f"資金寿命を約{extended_years:.1f}年延ばせます"
                    )

        # 公的支援の提案
        if self.monthly_support == 0:
            suggestions.append(
                "障害年金や生活保護などの公的支援制度の利用を検討してください"
            )

        # 固定費見直しの提案
        if self.monthly_expenses > 100000:
            suggestions.append(
                "固定費（通信費、光熱費など）の見直しから始めることをお勧めします"
            )

        # 少額でも収入を得る提案
        if self.monthly_support < 50000:
            suggestions.append(
                "在宅でできる軽作業など、無理のない範囲での収入源も検討してみてください"
            )

        return suggestions

    def generate_advice_message(self, result: Dict) -> str:
        """
        アドバイスメッセージを生成

        Args:
            result: 計算結果

        Returns:
            アドバイスメッセージ
        """
        if result["depletion_year"]:
            years = result["years_until_depletion"]
            message = (
                f"現在の状況では、約{years}年後に資金が不足する可能性があります。"
                "でも大丈夫です。小さな工夫で改善できることがたくさんあります。"
                "まずは月に一度、支出を振り返ることから始めてみませんか？"
            )
        else:
            message = (
                "現在の状況であれば、シミュレーション期間内は資金が持続する見込みです。"
                "とはいえ、予期せぬ出費に備えて、少しずつでも貯蓄を増やすことをお勧めします。"
            )

        return message
