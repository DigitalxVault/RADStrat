using UnityEngine;
using TMPro;

namespace RTTrainer.Design
{
    /// <summary>
    /// Central design system for GenAI R/T Trainer.
    /// Use these tokens for consistent styling across all UI components.
    /// </summary>

    #region Color System

    /// <summary>
    /// Base color palette - neutrals for backgrounds and text
    /// </summary>
    public static class BaseColors
    {
        // Slate tones - primary UI backgrounds
        public static readonly Color Slate900 = new Color(0.06f, 0.09f, 0.16f);   // #0F172A - Primary backgrounds
        public static readonly Color Slate800 = new Color(0.12f, 0.16f, 0.23f);   // #1E293B - Card backgrounds
        public static readonly Color Slate700 = new Color(0.20f, 0.25f, 0.33f);   // #334155 - Secondary panels
        public static readonly Color Slate600 = new Color(0.28f, 0.33f, 0.41f);   // #475569 - Borders, dividers
        public static readonly Color Slate500 = new Color(0.39f, 0.45f, 0.55f);   // #64748B - Hover states
        public static readonly Color Slate400 = new Color(0.58f, 0.64f, 0.72f);   // #94A3B8 - Secondary text
        public static readonly Color Slate300 = new Color(0.80f, 0.84f, 0.89f);   // #CBD5E1 - Tertiary text
        public static readonly Color Slate200 = new Color(0.89f, 0.91f, 0.94f);   // #E2E8F0 - Primary text
        public static readonly Color Slate100 = new Color(0.95f, 0.96f, 0.98f);   // #F1F5F9 - Highlights

        // Deep backgrounds
        public static readonly Color Charcoal = new Color(0.09f, 0.09f, 0.11f);   // #18181B - Deepest background
        public static readonly Color NeutralGray = new Color(0.25f, 0.25f, 0.25f); // #404040 - Inactive
    }

    /// <summary>
    /// Accent colors - functional states and feedback
    /// </summary>
    public static class AccentColors
    {
        // Warning - Amber
        public static readonly Color AmberWarning = new Color(0.96f, 0.62f, 0.04f);  // #F59E0B
        public static readonly Color AmberLight = new Color(0.99f, 0.83f, 0.30f);    // #FCD34D
        public static readonly Color AmberDark = new Color(0.71f, 0.45f, 0.02f);     // #B45309

        // Info - Cyan
        public static readonly Color CyanInfo = new Color(0.02f, 0.71f, 0.83f);      // #06B6D4
        public static readonly Color CyanLight = new Color(0.40f, 0.91f, 0.98f);     // #67E8F9
        public static readonly Color CyanDark = new Color(0.01f, 0.51f, 0.60f);      // #0891B2

        // Success - Green
        public static readonly Color GreenSuccess = new Color(0.13f, 0.77f, 0.37f);  // #22C55E
        public static readonly Color GreenLight = new Color(0.53f, 0.94f, 0.67f);    // #86EFAC
        public static readonly Color GreenDark = new Color(0.09f, 0.55f, 0.26f);     // #16A34A

        // Critical - Red
        public static readonly Color RedCritical = new Color(0.94f, 0.27f, 0.27f);   // #EF4444
        public static readonly Color RedLight = new Color(0.99f, 0.65f, 0.65f);      // #FCA5A5
        public static readonly Color RedDark = new Color(0.73f, 0.20f, 0.20f);       // #DC2626
    }

    /// <summary>
    /// Semantic color mapping for UI states
    /// </summary>
    public static class SemanticColors
    {
        // Backgrounds
        public static Color BackgroundPrimary => BaseColors.Slate900;
        public static Color BackgroundSecondary => BaseColors.Slate800;
        public static Color BackgroundCard => BaseColors.Slate700;
        public static Color BackgroundDeep => BaseColors.Charcoal;

        // Text
        public static Color TextPrimary => BaseColors.Slate200;
        public static Color TextSecondary => BaseColors.Slate400;
        public static Color TextDisabled => BaseColors.Slate600;
        public static Color TextOnAccent => BaseColors.Slate900;

        // Borders
        public static Color BorderDefault => BaseColors.Slate600;
        public static Color BorderFocus => AccentColors.CyanInfo;
        public static Color BorderError => AccentColors.RedCritical;
        public static Color BorderSuccess => AccentColors.GreenSuccess;

        // Interactive states
        public static Color StateIdle => BaseColors.Slate600;
        public static Color StateHover => BaseColors.Slate500;
        public static Color StateActive => AccentColors.CyanInfo;
        public static Color StateDisabled => BaseColors.NeutralGray;
        public static Color StateSuccess => AccentColors.GreenSuccess;
        public static Color StateWarning => AccentColors.AmberWarning;
        public static Color StateError => AccentColors.RedCritical;
        public static Color StateListening => AccentColors.CyanInfo;
    }

    #endregion

    #region Typography

    /// <summary>
    /// Typography scale and settings
    /// </summary>
    public static class Typography
    {
        // Font sizes (in pixels for UI)
        public const float DisplayXL = 48f;
        public const float DisplayL = 36f;
        public const float Heading1 = 28f;
        public const float Heading2 = 24f;
        public const float Heading3 = 20f;
        public const float BodyL = 18f;
        public const float BodyM = 16f;
        public const float BodyS = 14f;
        public const float Caption = 12f;
        public const float MonoL = 18f;
        public const float MonoM = 16f;

        // Line heights (as multipliers)
        public const float LineHeightTight = 1.1f;
        public const float LineHeightNormal = 1.3f;
        public const float LineHeightRelaxed = 1.5f;
        public const float LineHeightLoose = 1.6f;

        // Letter spacing
        public const float LetterSpacingTight = -0.02f;
        public const float LetterSpacingNormal = 0f;
        public const float LetterSpacingWide = 0.02f;
        public const float LetterSpacingMono = 0.05f;
    }

    #endregion

    #region Spacing System

    /// <summary>
    /// Spacing tokens based on 4px grid
    /// </summary>
    public static class Spacing
    {
        public const float Space0 = 0f;
        public const float Space1 = 4f;
        public const float Space2 = 8f;
        public const float Space3 = 12f;
        public const float Space4 = 16f;
        public const float Space5 = 20f;
        public const float Space6 = 24f;
        public const float Space8 = 32f;
        public const float Space10 = 40f;
        public const float Space12 = 48f;
        public const float Space16 = 64f;

        // Semantic spacing
        public const float CardPadding = Space4;
        public const float SectionGap = Space6;
        public const float ScreenPadding = Space8;
        public const float ElementGap = Space3;
    }

    /// <summary>
    /// Border radius tokens
    /// </summary>
    public static class BorderRadius
    {
        public const float None = 0f;
        public const float Small = 4f;
        public const float Medium = 8f;
        public const float Large = 16f;
        public const float XLarge = 24f;
        public const float Full = 9999f; // For circular elements

        // Semantic
        public const float Card = Large;
        public const float Button = Medium;
        public const float Input = Medium;
        public const float Modal = XLarge;
        public const float Badge = Small;
    }

    #endregion

    #region Animation

    /// <summary>
    /// Animation timing constants
    /// </summary>
    public static class AnimationTiming
    {
        // Durations in seconds
        public const float Instant = 0.05f;
        public const float Fast = 0.1f;
        public const float Normal = 0.2f;
        public const float Slow = 0.3f;
        public const float XSlow = 0.5f;
        public const float Loading = 1f;

        // Semantic durations
        public const float MicroInteraction = Fast;
        public const float StateChange = Normal;
        public const float PanelTransition = Slow;
        public const float ScreenTransition = XSlow;
        public const float FeedbackFlash = Slow;
    }

    #endregion

    #region Component Sizes

    /// <summary>
    /// Standard component dimensions
    /// </summary>
    public static class ComponentSizes
    {
        // Button heights
        public const float ButtonSmall = 32f;
        public const float ButtonMedium = 40f;
        public const float ButtonLarge = 48f;

        // Icon sizes
        public const float IconSmall = 16f;
        public const float IconMedium = 24f;
        public const float IconLarge = 32f;
        public const float IconXLarge = 48f;

        // MicButton
        public const float MicButtonMedium = 64f;
        public const float MicButtonLarge = 80f;

        // Layout
        public const float TopBarHeight = 64f;
        public const float SideNavWidth = 160f;
        public const float ModalMaxWidth = 600f;

        // Touch targets (minimum)
        public const float MinTouchTarget = 44f;
    }

    #endregion

    #region ScriptableObject Definitions

    /// <summary>
    /// ScriptableObject for text styling
    /// </summary>
    [CreateAssetMenu(fileName = "TextStyle", menuName = "RTTrainer/Design/Text Style")]
    public class TextStyleSO : ScriptableObject
    {
        public TMP_FontAsset font;
        public float fontSize = Typography.BodyM;
        public FontStyles fontStyle = FontStyles.Normal;
        public float lineSpacing = Typography.LineHeightRelaxed;
        public float characterSpacing = Typography.LetterSpacingNormal;
        public Color color = BaseColors.Slate200;

        public void ApplyTo(TMP_Text textComponent)
        {
            if (textComponent == null) return;

            if (font != null) textComponent.font = font;
            textComponent.fontSize = fontSize;
            textComponent.fontStyle = fontStyle;
            textComponent.lineSpacing = lineSpacing;
            textComponent.characterSpacing = characterSpacing;
            textComponent.color = color;
        }
    }

    /// <summary>
    /// ScriptableObject for color themes
    /// </summary>
    [CreateAssetMenu(fileName = "ColorTheme", menuName = "RTTrainer/Design/Color Theme")]
    public class ColorThemeSO : ScriptableObject
    {
        [Header("Backgrounds")]
        public Color backgroundPrimary = BaseColors.Slate900;
        public Color backgroundSecondary = BaseColors.Slate800;
        public Color backgroundCard = BaseColors.Slate700;

        [Header("Text")]
        public Color textPrimary = BaseColors.Slate200;
        public Color textSecondary = BaseColors.Slate400;
        public Color textDisabled = BaseColors.Slate600;

        [Header("Accents")]
        public Color accentPrimary = AccentColors.CyanInfo;
        public Color accentSuccess = AccentColors.GreenSuccess;
        public Color accentWarning = AccentColors.AmberWarning;
        public Color accentError = AccentColors.RedCritical;

        [Header("Borders")]
        public Color borderDefault = BaseColors.Slate600;
        public Color borderFocus = AccentColors.CyanInfo;
    }

    /// <summary>
    /// ScriptableObject for component configuration
    /// </summary>
    [CreateAssetMenu(fileName = "ComponentConfig", menuName = "RTTrainer/Design/Component Config")]
    public class ComponentConfigSO : ScriptableObject
    {
        [Header("Spacing")]
        public float padding = Spacing.CardPadding;
        public float gap = Spacing.ElementGap;

        [Header("Border")]
        public float borderRadius = BorderRadius.Card;
        public float borderWidth = 1f;

        [Header("Animation")]
        public float transitionDuration = AnimationTiming.Normal;
    }

    #endregion

    #region Utility Extensions

    /// <summary>
    /// Extension methods for design system utilities
    /// </summary>
    public static class DesignExtensions
    {
        /// <summary>
        /// Returns color with modified alpha
        /// </summary>
        public static Color WithAlpha(this Color color, float alpha)
        {
            return new Color(color.r, color.g, color.b, alpha);
        }

        /// <summary>
        /// Returns color lightened by percentage (0-1)
        /// </summary>
        public static Color Lighten(this Color color, float amount)
        {
            return Color.Lerp(color, Color.white, amount);
        }

        /// <summary>
        /// Returns color darkened by percentage (0-1)
        /// </summary>
        public static Color Darken(this Color color, float amount)
        {
            return Color.Lerp(color, Color.black, amount);
        }

        /// <summary>
        /// Converts Color to hex string
        /// </summary>
        public static string ToHex(this Color color)
        {
            return ColorUtility.ToHtmlStringRGB(color);
        }
    }

    #endregion

    #region Role Colors

    /// <summary>
    /// Vehicle role color assignments
    /// </summary>
    public static class RoleColors
    {
        public static readonly Color Bowser = new Color(0.24f, 0.35f, 0.24f);           // #3D5A3D
        public static readonly Color SecurityTrooper = new Color(0.18f, 0.18f, 0.29f);  // #2D2D4A
        public static readonly Color AFE = new Color(0.29f, 0.29f, 0.18f);              // #4A4A2D
        public static readonly Color Contractor = new Color(0.29f, 0.29f, 0.29f);       // #4A4A4A
        public static readonly Color FireTender = new Color(0.35f, 0.18f, 0.18f);       // #5A2D2D

        public static Color GetRoleColor(string role)
        {
            return role.ToLower() switch
            {
                "bowser" => Bowser,
                "security" or "securitytrooper" => SecurityTrooper,
                "afe" => AFE,
                "contractor" => Contractor,
                "fire" or "firetender" => FireTender,
                _ => BaseColors.Slate600
            };
        }
    }

    #endregion

    #region Quality Score Colors

    /// <summary>
    /// Color mapping for quality/score displays
    /// </summary>
    public static class ScoreColors
    {
        public static Color GetScoreColor(float score)
        {
            return score switch
            {
                >= 0.9f => AccentColors.GreenSuccess,
                >= 0.7f => AccentColors.CyanInfo,
                >= 0.4f => AccentColors.AmberWarning,
                _ => AccentColors.RedCritical
            };
        }

        public static string GetScoreGrade(float score)
        {
            return score switch
            {
                >= 0.9f => "EXCELLENT",
                >= 0.75f => "GOOD",
                >= 0.6f => "FAIR",
                _ => "NEEDS WORK"
            };
        }
    }

    #endregion
}
