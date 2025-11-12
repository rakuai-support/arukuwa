"""
Gemini AI Service
"""
import os
from typing import Dict, List, Optional
import google.generativeai as genai
from flask import current_app


class GeminiService:
    """Google Gemini API service for AI-powered analysis"""

    def __init__(self):
        """Initialize Gemini API"""
        api_key = current_app.config.get("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            self.enabled = False
            current_app.logger.warning("Gemini API key not configured. AI analysis will use fallback mode.")
        else:
            self.enabled = True
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                current_app.config.get("GEMINI_MODEL", "gemini-pro")
            )
            self.temperature = current_app.config.get("GEMINI_TEMPERATURE", 0.7)
            self.max_tokens = current_app.config.get("GEMINI_MAX_TOKENS", 2048)

    def analyze_life_plan(
        self,
        user_info: Dict,
        calculation_result: Dict
    ) -> Dict:
        """
        Analyze life plan using Gemini API

        Args:
            user_info: User input data (age, expenses, assets, etc.)
            calculation_result: Calculation results

        Returns:
            Dictionary containing:
            - risk_factors: List of identified risks
            - suggestions: List of improvement suggestions
            - advice_message: Personalized advice message
        """
        if not self.enabled:
            return self._fallback_analysis(user_info, calculation_result)

        try:
            prompt = self._build_prompt(user_info, calculation_result)
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens,
                }
            )

            # Log the raw response for debugging
            current_app.logger.info(f"Gemini API raw response: {response.text}")

            # Parse response
            analysis = self._parse_response(response.text)
            return analysis

        except Exception as e:
            current_app.logger.error(f"Gemini API error: {str(e)}")
            import traceback
            current_app.logger.error(f"Traceback: {traceback.format_exc()}")
            return self._fallback_analysis(user_info, calculation_result)

    def _build_prompt(self, user_info: Dict, calculation_result: Dict) -> str:
        """Build prompt for Gemini API"""
        age = user_info.get("age")
        monthly_expenses = user_info.get("monthly_expenses")
        total_assets = user_info.get("total_assets")
        monthly_support = user_info.get("monthly_support", 0)
        support_type = user_info.get("support_type", "none")

        depletion_age = calculation_result.get("depletion_age")
        years_until_depletion = calculation_result.get("years_until_depletion")

        prompt = f"""あなたは、ひきこもりの方々の生活設計を支援する優しいライフプランアドバイザーです。
以下の情報に基づいて、心理的負担を最小限にしながら、具体的で実践的なアドバイスを提供してください。

## ユーザー情報
- 年齢: {age}歳
- 月間生活費: {monthly_expenses:,}円
- 現在の資産: {total_assets:,}円
- 月間収入（公的支援等）: {monthly_support:,}円
- 収入の種類: {self._support_type_label(support_type)}

## シミュレーション結果
"""

        if depletion_age:
            prompt += f"- 資産枯渇予測年齢: {depletion_age}歳（約{years_until_depletion}年後）\n"
            prompt += "- 状況: 現在の生活を続けると、資産が尽きる可能性があります\n"
        else:
            prompt += "- 資産は長期的に維持できる見込みです\n"

        prompt += """
## アドバイスの形式

以下の形式で回答してください：

### リスク要因
[箇条書きで3-5項目]
- 具体的なリスク要因を挙げてください
- 責めるような表現は避け、客観的に記述してください

### 改善のための提案
[箇条書きで3-5項目]
- 実践しやすい具体的な提案をしてください
- 小さな一歩から始められる内容を含めてください
- 心理的ハードルが低いものを優先してください

### アドバイスメッセージ
[200-300文字程度の文章]
- 温かく、励ますトーンで書いてください
- 批判や否定的な表現は避けてください
- 「できること」に焦点を当ててください
- 具体的な行動を1-2つ提案してください
- 孤独感を和らげるような表現を含めてください

## 重要な注意事項
1. ひきこもりの方の心理的負担に配慮してください
2. 「すぐに働く」「外に出る」などの急激な変化を強要しないでください
3. 小さな成功体験を積み重ねることの重要性を伝えてください
4. 利用可能な社会資源（障害年金、生活保護、支援団体など）の情報も含めてください
5. 前向きで希望を持てるメッセージにしてください
"""

        return prompt

    def _support_type_label(self, support_type: str) -> str:
        """Convert support type to label"""
        labels = {
            "pension": "障害年金",
            "welfare": "生活保護",
            "other": "その他",
            "none": "なし"
        }
        return labels.get(support_type, "なし")

    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini API response"""
        if not response_text:
            return {
                "risk_factors": [],
                "suggestions": [],
                "advice_message": self._generate_fallback_advice([], [])
            }

        lines = response_text.strip().split('\n')

        risk_factors = []
        suggestions = []
        advice_message = []

        current_section = None

        for line in lines:
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Detect section headers
            if line.startswith('#') or '###' in line:
                if 'リスク' in line:
                    current_section = 'risk'
                elif '提案' in line or '改善' in line:
                    current_section = 'suggestion'
                elif 'アドバイス' in line or 'メッセージ' in line:
                    current_section = 'advice'
                continue

            # Parse bullet points
            if line.startswith('-') or line.startswith('•') or line.startswith('*') or line.startswith('- '):
                # Remove bullet point marker
                content = line.lstrip('-•* ').strip()
                if content:
                    if current_section == 'risk':
                        risk_factors.append(content)
                    elif current_section == 'suggestion':
                        suggestions.append(content)
            else:
                # Regular text for advice message
                if current_section == 'advice' and line:
                    advice_message.append(line)

        # If no structured data was found, try to extract something useful
        if not risk_factors and not suggestions and not advice_message:
            current_app.logger.warning("Failed to parse structured response, using raw text")
            advice_message = [response_text[:500]]  # Use first 500 chars as advice

        return {
            "risk_factors": risk_factors[:5] if risk_factors else [],
            "suggestions": suggestions[:5] if suggestions else [],
            "advice_message": '\n'.join(advice_message) if advice_message else self._generate_fallback_advice(risk_factors, suggestions)
        }

    def _fallback_analysis(self, user_info: Dict, calculation_result: Dict) -> Dict:
        """Fallback analysis when Gemini API is not available"""
        from app.services.calculator import LifePlanCalculator

        calculator = LifePlanCalculator(
            age=user_info.get("age"),
            monthly_expenses=user_info.get("monthly_expenses"),
            total_assets=user_info.get("total_assets"),
            monthly_support=user_info.get("monthly_support", 0)
        )

        risk_factors = calculator.get_risk_factors(calculation_result)
        suggestions = calculator.get_suggestions(calculation_result)
        advice_message = calculator.generate_advice_message(calculation_result)

        return {
            "risk_factors": risk_factors,
            "suggestions": suggestions,
            "advice_message": advice_message
        }

    def _generate_fallback_advice(self, risk_factors: List[str], suggestions: List[str]) -> str:
        """Generate fallback advice message"""
        return """お疲れ様です。将来のことを考えるのは、とても勇気のいることですね。

今回の分析結果を見ると、いくつか気をつけたい点が見つかりましたが、これは「今できること」を考えるための材料です。責める必要は全くありません。

まずは、できることから少しずつ始めてみましょう。例えば、月々の支出を見直すことや、利用できる公的支援を調べてみることから始めるのはいかがでしょうか。

一人で抱え込まず、必要に応じて専門家や支援団体に相談することも大切です。あなたのペースで、無理のない範囲で進めていきましょう。"""


# Singleton instance
_gemini_service = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
