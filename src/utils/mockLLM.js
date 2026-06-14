/**
 * Mock LLM responses for testing without hitting real APIs.
 * Simulates realistic delays and responses for each feature.
 */

const MOCK_DELAY_MS = 800; // Simulate network latency

/**
 * Simulate delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main mock function — detects feature by systemPrompt and returns mock JSON
 */
export async function mockCallLLM(systemPrompt, userMessage, imageBase64) {
  await delay(MOCK_DELAY_MS);

  // Situation Checkout: "my kid has fever" → product suggestions
  if (systemPrompt.includes('quick-commerce shopping')) {
    return JSON.stringify({
      items: [
        { name: 'Calpol 500mg Tablets', brand: 'GSK', price: 32, reason: 'Fast-acting fever relief for kids' },
        { name: 'Electral ORS Sachets', brand: 'Electral', price: 65, reason: 'Prevent dehydration' },
        { name: 'Vicks VapoRub 50g', brand: 'Vicks', price: 79, reason: 'Ease congestion at night' },
        { name: 'Omron Digital Thermometer', brand: 'Omron', price: 249, reason: 'Accurate temperature monitoring' },
        { name: 'Dettol Antiseptic Liquid', brand: 'Dettol', price: 89, reason: 'Disinfect minor wounds' },
      ],
    });
  }

  // Smart Reorder: order history → replenishment predictions
  if (systemPrompt.includes('household replenishment')) {
    return JSON.stringify({
      predictions: [
        { productName: 'Pampers Active Baby Diapers', reasoning: 'Ordered 3 times, likely running low', urgency: 'high' },
        { productName: 'Amul Taaza Milk 1L', reasoning: 'Weekly staple, 13 days since last order', urgency: 'high' },
        { productName: 'Aashirvaad Atta 5kg', reasoning: 'Monthly staple, due for replenishment', urgency: 'medium' },
        { productName: 'Colgate MaxFresh Toothpaste', reasoning: 'Last ordered 81 days ago', urgency: 'medium' },
      ],
    });
  }

  // Photo to Cart: image recognition
  if (systemPrompt.includes('product recognition')) {
    // If image was provided, pretend we analyzed it
    if (imageBase64) {
      return JSON.stringify({
        detected: 'A blue plastic water bottle with a flip cap',
        suggestion: {
          name: 'Bisleri Water 1L Bottle',
          brand: 'Bisleri',
          price: 20,
          category: 'beverages',
        },
      });
    }
    // Fallback if no image
    return JSON.stringify({
      detected: 'Unable to identify product from image',
      suggestion: { name: 'Unknown Product', brand: '?', price: 0, category: 'other' },
    });
  }

  // Calendar Shopping: event-based suggestions
  if (systemPrompt.includes('proactive shopping')) {
    return JSON.stringify({
      headline: "Perfect for your upcoming event",
      items: [
        { name: 'Decorative Balloons Pack (30 pcs)', price: 149, reason: 'Festive party decoration' },
        { name: 'Birthday Cake Candles (24 pcs)', price: 45, reason: 'Make a wish moment' },
        { name: 'Cadbury Celebrations Gift Box', price: 299, reason: 'Sweet gift for the birthday person' },
        { name: 'Paper Plates (50 pcs)', price: 120, reason: 'Hassle-free serving' },
        { name: "Lay's Party Pack Assorted", price: 175, reason: 'Party snacking sorted' },
      ],
    });
  }

  // Unknown feature — return generic error
  return JSON.stringify({ error: 'Mock: Unknown feature type' });
}
