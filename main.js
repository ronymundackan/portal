import './style.css'
import Fuse from 'fuse.js'

let certificateData = [];
let fuse;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsBox = document.getElementById('suggestionsBox');
const resultArea = document.getElementById('resultArea');
const notFoundArea = document.getElementById('notFoundArea');
const landingInfo = document.getElementById('landingInfo');

const participantNameEl = document.getElementById('participantName');
const viewPdfBtn = document.getElementById('viewPdfBtn');
const pdfViewer = document.getElementById('pdfViewer');

// Fetch the database on load
async function loadDatabase() {
  try {
    const response = await fetch('/certificates.json');
    if (!response.ok) throw new Error("Failed to load database");
    certificateData = await response.json();
    
    // Initialize Fuse.js for fuzzy searching
    fuse = new Fuse(certificateData, {
      keys: ['name'],
      threshold: 0.4, // Lower is more strict, 0.4 allows for decent typos
      includeScore: true
    });
    
    console.log(`Loaded ${certificateData.length} certificates.`);
  } catch (error) {
    console.error(error);
  }
}

function showResult(entry) {
  // Hide suggestions, landing info, and reset areas
  suggestionsBox.classList.add('hidden');
  notFoundArea.classList.add('hidden');
  if (landingInfo) landingInfo.classList.add('hidden');
  
  // Update texts and links
  participantNameEl.textContent = entry.name;
  
  // Set the PDF Viewer Source
  // We'll point to certificates/<filename> and use #view=Fit to force the PDF viewer to zoom perfectly
  const pdfUrl = `certificates/${encodeURIComponent(entry.file)}#view=Fit`;
  viewPdfBtn.href = pdfUrl;
  pdfViewer.src = pdfUrl;

  // Show the success area
  resultArea.classList.remove('hidden');
}

function showNotFound() {
  suggestionsBox.classList.add('hidden');
  resultArea.classList.add('hidden');
  if (landingInfo) landingInfo.classList.add('hidden');
  notFoundArea.classList.remove('hidden');
}

function handleSearch(query) {
  query = query.toLowerCase().trim();
  if (!query) {
    suggestionsBox.classList.add('hidden');
    resultArea.classList.add('hidden');
    notFoundArea.classList.add('hidden');
    if (landingInfo) landingInfo.classList.remove('hidden');
    return;
  }

  // Exact match logic when pressing Enter/Search icon
  const fuseResults = fuse.search(query);
  if (fuseResults.length > 0) {
    // If the top match is very close, show it
    showResult(fuseResults[0].item);
  } else {
    showNotFound();
  }
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    suggestionsBox.classList.add('hidden');
    resultArea.classList.add('hidden');
    notFoundArea.classList.add('hidden');
    if (landingInfo) landingInfo.classList.remove('hidden');
    return;
  }

  // Filter for suggestions using Fuse
  const fuseResults = fuse.search(query).slice(0, 5);
  
  if (fuseResults.length > 0) {
    suggestionsBox.innerHTML = '';
    fuseResults.forEach(result => {
      const match = result.item;
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = match.name;
      div.addEventListener('click', () => {
        searchInput.value = match.name;
        showResult(match);
      });
      suggestionsBox.appendChild(div);
    });
    suggestionsBox.classList.remove('hidden');
  } else {
    suggestionsBox.classList.add('hidden');
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch(searchInput.value);
  }
});

searchBtn.addEventListener('click', () => {
  handleSearch(searchInput.value);
});

// Initialize
loadDatabase();
