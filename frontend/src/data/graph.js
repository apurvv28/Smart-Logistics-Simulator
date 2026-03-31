export const indianLogisticsGraph = {
  nodeCount: 14,
  edges: [
    { from: 0, to: 1, weight: 150, bidirectional: true }, // Mumbai - Pune
    { from: 0, to: 3, weight: 280, bidirectional: true }, // Mumbai - Surat
    { from: 3, to: 2, weight: 260, bidirectional: true }, // Surat - Ahmedabad
    { from: 2, to: 8, weight: 670, bidirectional: true }, // Ahmedabad - Jaipur
    { from: 8, to: 7, weight: 280, bidirectional: true }, // Jaipur - Delhi
    { from: 7, to: 9, weight: 550, bidirectional: true }, // Delhi - Lucknow
    { from: 9, to: 13, weight: 100, bidirectional: true }, // Lucknow - Kanpur
    { from: 13, to: 10, weight: 1000, bidirectional: true }, // Kanpur - Kolkata
    { from: 10, to: 11, weight: 1100, bidirectional: true }, // Kolkata - Nagpur
    { from: 11, to: 6, weight: 500, bidirectional: true }, // Nagpur - Hyderabad
    { from: 6, to: 4, weight: 570, bidirectional: true }, // Hyderabad - Bengaluru
    { from: 4, to: 5, weight: 350, bidirectional: true }, // Bengaluru - Chennai
    { from: 5, to: 6, weight: 630, bidirectional: true }, // Chennai - Hyderabad
    { from: 0, to: 11, weight: 800, bidirectional: true }, // Mumbai - Nagpur
    { from: 1, to: 6, weight: 700, bidirectional: true }, // Pune - Hyderabad
    { from: 1, to: 4, weight: 840, bidirectional: true }, // Pune - Bengaluru
    { from: 7, to: 13, weight: 480, bidirectional: true }, // Delhi - Kanpur
    { from: 12, to: 0, weight: 580, bidirectional: true }, // Indore - Mumbai
    { from: 12, to: 2, weight: 390, bidirectional: true }, // Indore - Ahmedabad
    { from: 12, to: 8, weight: 600, bidirectional: true }, // Indore - Jaipur
    { from: 12, to: 11, weight: 440, bidirectional: true }  // Indore - Nagpur
  ]
};
