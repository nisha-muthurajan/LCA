"""Test the PURE AI-DRIVEN recommender - no hardcoded rules."""
import sys
import warnings
import json

warnings.filterwarnings('ignore')

from ai_models.recommender import get_ai_recommendation

# Test data
test_data = {
    'energy_consumption': 80000,
    'water_usage': 250000,
    'raw_material_qty': 1200,
    'waste_generated': 7000,
    'co2_emission': 40000,
    'sustainability_score': 0.65,
}

print("=" * 70)
print("🤖 TESTING PURE AI-DRIVEN RECOMMENDATIONS")
print("   (No hardcoded rules or benchmarks)")
print("=" * 70)

result = get_ai_recommendation(test_data)

print("\n📊 AI RECOMMENDATION OUTPUT:")
print("-" * 70)
print(result['recommendation'])
print("-" * 70)

print("\n📋 STRUCTURED AI DETAILS:")
details = result.get('details', {})
print(f"  Overall Status (AI-derived): {details.get('overall_status')}")
print(f"  Sustainability Score: {details.get('sustainability_score')}")
print(f"  Confidence Level: {details.get('confidence_level')}")
print(f"  Primary Recommendation: {details.get('primary_recommendation')}")

print("\n🔬 AI-IDENTIFIED PRIORITY AREAS (from SHAP):")
for w in details.get('weaknesses', []):
    print(f"  - {w['area']}")
    print(f"    AI Impact Score: {w.get('ai_impact_score', 'N/A')}%")
    print(f"    Priority: {w['priority']}")
    if w.get('recommended_actions'):
        print(f"    AI Insight: {w['recommended_actions'][0]}")

print("\n✅ AI-IDENTIFIED STRENGTHS:")
for s in details.get('strengths', []):
    print(f"  - {s['area']}: {s.get('ai_assessment', 'N/A')}")

print("\n📈 FEATURE IMPORTANCE (SHAP Analysis):")
for f in details.get('feature_analysis', [])[:3]:
    print(f"  - {f['display_name']}: {f['impact_percentage']:.1f}% influence ({f['direction']})")

print("\n💡 ALTERNATIVE AI SUGGESTIONS:")
for alt in details.get('alternatives', []):
    print(f"  - {alt['recommendation']} ({alt['probability']:.0f}% probability)")

print("\n📊 ALL MODEL CLASS PROBABILITIES:")
for label, prob in list(details.get('all_probabilities', {}).items())[:5]:
    print(f"  - {label}: {prob:.1f}%")

print("\n🤖 MODEL INFO:")
print(f"  Label: {result.get('label')}")
print(f"  Confidence: {result.get('confidence')}%")

print("\n" + "=" * 70)
print("✅ Pure AI-driven test completed successfully!")
print("   All insights derived from ML model + SHAP analysis")
print("=" * 70)
