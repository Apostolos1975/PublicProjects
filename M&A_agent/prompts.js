/* ============================================
   M&A Tool - Prompts Management
   ============================================
   
   This file contains all prompts used in the M&A Tool.
   Naming convention: PROMPT_<SECTION>_<PURPOSE>
   
   Example:
   - PROMPT_DUE_DILIGENCE_BASE - Base prompt for Due Diligence section
   - PROMPT_FINANCIAL_ANALYSIS_VALUATION - Prompt for Financial Analysis
*/

// ============================================
// Prompt Building Functions
// ============================================

/**
 * Build the base prompt with company details
 * This is prepended to all user prompts to provide context
 * 
 * @param {Object} companyData - Company data object with name, url, taxonomy
 * @returns {string} Formatted prompt with company details
 */
function PROMPT_BUILD_WITH_COMPANY_DETAILS(companyData) {
    let prompt = '';
    
    // Add company details if available
    if (companyData && (companyData.companyName || companyData.url || companyData.taxonomy)) {
        prompt += 'Company name: ' + (companyData.companyName || 'Not specified') + '\n';
        prompt += 'Company URL: ' + (companyData.url || 'Not specified') + '\n';
        prompt += 'Domain: ' + (companyData.taxonomy || 'To be specified later') + '\n';
        prompt += '\n';
    }
    
    return prompt;
}

/**
 * Build the complete prompt by combining company details with user input
 * 
 * @param {string} userPrompt - The user's input prompt
 * @param {Object} companyData - Company data object
 * @returns {string} Complete formatted prompt ready to send to ChatGPT
 */
function PROMPT_BUILD_COMPLETE(userPrompt, companyData) {
    const companyDetails = PROMPT_BUILD_WITH_COMPANY_DETAILS(companyData);
    return companyDetails + userPrompt;
}

// ============================================
// Prompt Templates by Section
// ============================================

/**
 * Section 1: Deal Sourcing & Pipeline Management
 */
const PROMPT_SECTION_1_DEAL_SOURCING = {
    // Future prompt templates for this section can be added here
    // Example: PROMPT_TEMPLATE_TARGET_DISCOVERY: "..."
};

/**
 * Section 2: Financial Analysis & Valuation
 */
const PROMPT_SECTION_2_FINANCIAL_ANALYSIS = {
    // Future prompt templates for this section can be added here
    // Example: PROMPT_TEMPLATE_DCF_VALUATION: "..."
};

/**
 * Section 3: Due Diligence Management
 * This is the current active section with ChatGPT interface
 */
const PROMPT_SECTION_3_DUE_DILIGENCE = {
    // Prompt templates for Due Diligence section
    PROMPT_TEMPLATE_1_RISK_ANALYSIS: "Analyze the key risks associated with this target company. Consider financial, operational, legal, and strategic risks. Provide a comprehensive risk assessment with recommendations for mitigation strategies.",
    
    PROMPT_TEMPLATE_2_COMPLIANCE_CHECK: "Conduct a thorough compliance review for this target company. Assess regulatory compliance, industry standards adherence, and any potential compliance issues. Include recommendations for addressing identified gaps.",
    
    PROMPT_TEMPLATE_3_FINANCIAL_REVIEW: "Perform a detailed financial analysis of this target company. Review financial statements, assess financial health, identify trends, and evaluate the company's financial position. Provide insights on profitability, liquidity, and solvency."
};

/**
 * Get all Due Diligence prompt templates as an array of objects
 * Each object contains: { id, name, prompt }
 * @returns {Array} Array of prompt template objects
 */
function PROMPT_GET_DUE_DILIGENCE_TEMPLATES() {
    return [
        {
            id: 'PROMPT_TEMPLATE_1_RISK_ANALYSIS',
            name: 'Risk Analysis',
            prompt: PROMPT_SECTION_3_DUE_DILIGENCE.PROMPT_TEMPLATE_1_RISK_ANALYSIS
        },
        {
            id: 'PROMPT_TEMPLATE_2_COMPLIANCE_CHECK',
            name: 'Compliance Check',
            prompt: PROMPT_SECTION_3_DUE_DILIGENCE.PROMPT_TEMPLATE_2_COMPLIANCE_CHECK
        },
        {
            id: 'PROMPT_TEMPLATE_3_FINANCIAL_REVIEW',
            name: 'Financial Review',
            prompt: PROMPT_SECTION_3_DUE_DILIGENCE.PROMPT_TEMPLATE_3_FINANCIAL_REVIEW
        }
    ];
}

/**
 * Section 4: Collaboration & Governance
 */
const PROMPT_SECTION_4_COLLABORATION = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 5: Deal Structuring & Execution
 */
const PROMPT_SECTION_5_DEAL_STRUCTURING = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 6: Post-Merger Integration (PMI)
 */
const PROMPT_SECTION_6_POST_MERGER = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 7: Intelligence & Benchmarking
 */
const PROMPT_SECTION_7_INTELLIGENCE = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 8: Security, Compliance & Trust
 */
const PROMPT_SECTION_8_SECURITY = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 9: Automation & AI
 */
const PROMPT_SECTION_9_AUTOMATION = {
    // Future prompt templates for this section can be added here
};

/**
 * Section 10: Integration & Extensibility
 */
const PROMPT_SECTION_10_INTEGRATION = {
    // Future prompt templates for this section can be added here
};

// ============================================
// Export for use in other files
// ============================================

// Note: In a browser environment, these functions are available globally
// If using modules, you would export them like:
// export { PROMPT_BUILD_WITH_COMPANY_DETAILS, PROMPT_BUILD_COMPLETE };

