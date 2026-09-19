/**
 * Mock API Function to fetch driver profile.
 * 
 * TODO: Backend Integration
 * This is currently a foundational block returning a hardcoded Mock JSON Object.
 * In the future, replace this Promise-wrapped object with a real fetch() API call.
 * 
 * Example Future Code:
 * return fetch(`https://api.welfareboard.gov/driver/${cardId}`).then(res => res.json());
 */
async function fetchDriverProfile(cardId = "MH12_20180001234") {
  console.log(`[API] Fetching profile for: ${cardId}`);
  
  // Wrap in a Promise to simulate an asynchronous network request
  return new Promise((resolve) => {
    // Simulate network latency of 800ms
    setTimeout(() => {
      resolve({
        "driver_id": "MH12_20180001234",
        "status": "Active",
        "personal_info": {
          "name": "Sanjay Tukaram Patil",
          "dob": "15 Jan 1990",
          "blood_group": "B+"
        },
        "professional_info": {
          "vehicle_type": "Auto-Rickshaw",
          "license_no": "MH12 20180001234",
          "validity": "31 Dec 2028"
        },
        "welfare_board_data": {
          "latest_campaign": "Road Safety & Awareness Week 2026",
          "benefits_active": ["Health Insurance", "Financial Aid"],
          "emergency_contacts": {
            "general": "112",
            "personal": "98765 43210"
          }
        }
      });
    }, 800);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cardTarget = document.querySelector('#card-target');
  const uiContainer = document.querySelector('#spatial-ui-container');
  const loadingOverlay = document.querySelector('#ui-loading');
  
  // UI Panels
  const panelLeft = document.querySelector('#panel-left');
  const panelCenter = document.querySelector('#panel-center');
  const panelRight = document.querySelector('#panel-right');

  // Text Elements - Left Panel (Profile)
  const txtName = document.querySelector('#txt-name');
  const txtDob = document.querySelector('#txt-dob');
  const txtBg = document.querySelector('#txt-bg');
  const txtVehicle = document.querySelector('#txt-vehicle');
  const txtLic = document.querySelector('#txt-lic');
  const txtStatus = document.querySelector('#txt-status');

  // Text Elements - Right Panel (Welfare)
  const txtCampaign = document.querySelector('#txt-campaign');
  const txtBenefits = document.querySelector('#txt-benefits');
  const txtEmergency = document.querySelector('#txt-emergency');

  // State to track if data was already fetched to avoid re-fetching on every track loss/found
  let profileDataLoaded = false;

  /**
   * Helper function to parse JSON response and inject into A-Frame <a-text> DOM entities
   */
  function populateUI(data) {
    console.log('[UI] Populating spatial UI with data', data);
    
    // 1. Map to Left Panel
    txtName.setAttribute('value', `Name: ${data.personal_info.name}`);
    txtDob.setAttribute('value', `DOB: ${data.personal_info.dob}`);
    txtBg.setAttribute('value', `Blood Grp: ${data.personal_info.blood_group}`);
    txtVehicle.setAttribute('value', `Type: ${data.professional_info.vehicle_type}`);
    txtLic.setAttribute('value', `Lic: ${data.professional_info.license_no}`);
    txtStatus.setAttribute('value', data.status.toUpperCase());
    
    // 2. Map to Right Panel
    txtCampaign.setAttribute('value', data.welfare_board_data.latest_campaign);
    
    // Format array as bullet points
    const benefitsStr = data.welfare_board_data.benefits_active.join('\n• ');
    txtBenefits.setAttribute('value', `• ${benefitsStr}`);
    
    // Format emergency contacts
    const emergencyStr = `General: ${data.welfare_board_data.emergency_contacts.general}\nPersonal: ${data.welfare_board_data.emergency_contacts.personal}`;
    txtEmergency.setAttribute('value', emergencyStr);
  }

  // --- MindAR Event Listeners ---

  // When the physical ID card is recognized by the camera
  cardTarget.addEventListener('targetFound', async () => {
    console.log('[AR] Target Found');
    
    // 1. Fade out the "Scanning..." overlay
    loadingOverlay.style.opacity = '0';
    
    // 2. Make the spatial UI container visible
    uiContainer.setAttribute('visible', 'true');
    
    // 3. Trigger the elastic scale-up animations on the 3 panels
    panelLeft.emit('scale-up');
    panelCenter.emit('scale-up');
    panelRight.emit('scale-up');

    // 4. Fetch dynamic data (if not already fetched in this session)
    if (!profileDataLoaded) {
      try {
        const data = await fetchDriverProfile();
        populateUI(data);
        profileDataLoaded = true;
      } catch (error) {
        console.error('[AR] Error fetching driver data:', error);
      }
    }
  });

  // When the physical ID card is lost from the camera view
  cardTarget.addEventListener('targetLost', () => {
    console.log('[AR] Target Lost');
    
    // 1. Show the "Scanning..." overlay again
    loadingOverlay.style.opacity = '1';
    
    // 2. Hide the spatial UI to prevent it from floating randomly
    uiContainer.setAttribute('visible', 'false');
    
    // 3. Reset the scale of the panels so they animate properly next time
    panelLeft.setAttribute('scale', '0 0 0');
    panelCenter.setAttribute('scale', '0 0 0');
    panelRight.setAttribute('scale', '0 0 0');
  });
});
