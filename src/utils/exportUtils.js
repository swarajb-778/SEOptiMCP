import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Papa from 'papaparse'

// Export SEO Analysis as PDF
export const exportToPDF = async (elementId, filename = 'seo-analysis-report') => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found for PDF export')
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add title page
    pdf.setFontSize(20)
    pdf.text('SEO Analysis Report', 20, 30)
    pdf.setFontSize(12)
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
    pdf.text('Powered by SEOptiMCP', 20, 50)

    // Add main content
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`)
    return true
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to export PDF: ' + error.message)
  }
}

// Export Keywords as CSV
export const exportKeywordsToCSV = (keywords, filename = 'seo-keywords') => {
  try {
    if (!keywords || !Array.isArray(keywords)) {
      throw new Error('Invalid keywords data for CSV export')
    }

    // Prepare CSV data
    const csvData = keywords.map(keyword => ({
      'Keyword': keyword.keyword || '',
      'Search Volume': keyword.searchVolume || keyword.monthlySearchVolume || 'N/A',
      'Difficulty': keyword.difficulty || keyword.competitionLevel || 'N/A',
      'Competition': keyword.competition || 'N/A',
      'CPC': keyword.cpc || 'N/A',
      'Search Intent': keyword.searchIntent || keyword.intent || 'N/A',
      'Category': keyword.category || 'General',
      'Priority': keyword.priority || 'N/A',
      'Opportunity Score': keyword.opportunity || 'N/A',
      'Commercial Intent': keyword.commercialIntent || keyword.moneyIntent || 'N/A',
      'Content Angle': keyword.contentAngle || 'N/A',
      'Rationale': keyword.rationale || '',
      'Business Alignment': keyword.businessAlignment || 'N/A'
    }))

    // Convert to CSV
    const csv = Papa.unparse(csvData)
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('CSV export failed:', error)
    throw new Error('Failed to export CSV: ' + error.message)
  }
}

// Export Competition Analysis as CSV
export const exportCompetitionToCSV = (competitionData, filename = 'competition-analysis') => {
  try {
    if (!competitionData) {
      throw new Error('No competition data available for export')
    }

    const csvData = []
    
    // Add overall insights
    if (competitionData.overallInsights) {
      csvData.push({
        'Type': 'Overall Insights',
        'Metric': 'Best Opportunities',
        'Value': competitionData.overallInsights.bestOpportunities?.join('; ') || 'N/A'
      })
      
      csvData.push({
        'Type': 'Overall Insights',
        'Metric': 'Content Gaps',
        'Value': competitionData.overallInsights.contentGaps?.join('; ') || 'N/A'
      })
      
      csvData.push({
        'Type': 'Overall Insights',
        'Metric': 'Quick Wins',
        'Value': competitionData.overallInsights.quickWins?.join('; ') || 'N/A'
      })
      
      csvData.push({
        'Type': 'Overall Insights',
        'Metric': 'Positioning Advice',
        'Value': competitionData.overallInsights.positioningAdvice || 'N/A'
      })
    }

    // Add keyword-specific competition data
    if (competitionData.keywordCompetition) {
      competitionData.keywordCompetition.forEach(comp => {
        csvData.push({
          'Type': 'Keyword Competition',
          'Metric': 'Keyword',
          'Value': comp.keyword || 'N/A',
          'Competition Level': comp.competitionLevel || 'N/A',
          'Top Competitors': comp.topCompetitors?.join('; ') || 'N/A',
          'Opportunity': comp.opportunity || 'N/A'
        })
      })
    }

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Competition CSV export failed:', error)
    throw new Error('Failed to export competition analysis: ' + error.message)
  }
}

// Export Master Strategy as JSON
export const exportStrategyToJSON = (masterStrategy, filename = 'seo-master-strategy') => {
  try {
    if (!masterStrategy) {
      throw new Error('No strategy data available for export')
    }

    const jsonData = JSON.stringify(masterStrategy, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('JSON export failed:', error)
    throw new Error('Failed to export strategy: ' + error.message)
  }
}

// Export Complete Analysis Bundle
export const exportCompleteAnalysis = async (data, filename = 'complete-seo-analysis') => {
  try {
    const { keywordAnalysis, competitionData, masterStrategy } = data
    
    // Create a comprehensive data object
    const completeAnalysis = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalKeywords: keywordAnalysis?.expandedKeywords?.length || 0,
        analysisType: 'Google Gemini Enhanced Analysis',
        seoScore: masterStrategy?.executiveSummary?.currentScore || 0
      },
      keywordAnalysis: keywordAnalysis || null,
      competitionData: competitionData || null,
      masterStrategy: masterStrategy || null,
      exportMetadata: {
        version: '2.0',
        platform: 'SEOptiMCP',
        exportFormat: 'Complete Bundle'
      }
    }

    const jsonData = JSON.stringify(completeAnalysis, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Complete analysis export failed:', error)
    throw new Error('Failed to export complete analysis: ' + error.message)
  }
}

// Generate shareable report URL (placeholder for future implementation)
export const generateShareableLink = async (analysisData) => {
  // This would typically integrate with a backend service
  // For now, we'll create a data URL that could be shared
  try {
    const encodedData = btoa(JSON.stringify(analysisData))
    const shareableUrl = `${window.location.origin}/shared-report?data=${encodedData}`
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareableUrl)
    return shareableUrl
  } catch (error) {
    console.error('Failed to generate shareable link:', error)
    throw new Error('Failed to generate shareable link')
  }
} 