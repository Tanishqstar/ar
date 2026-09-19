/**
 * Mock API Function to fetch driver profile.
 * 
 * TODO: Backend Integration
 * In the future, replace this Promise-wrapped object with a real fetch() API call.
 * Example:
 * return fetch(`https://api.welfareboard.gov/driver/${cardId}`).then(res => res.json());
 */
async function fetchDriverProfile(cardId = "MH12_20180001234") {
  console.log(`[API] Fetching profile for: ${cardId}`);
  
  // Wrap in a Promise to simulate an asynchronous network request
  return new Promise((resolve) => {
    // Simulate network latency of 600ms
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
    }, 600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Master AR entities
  const cardTarget = document.querySelector('#card-target');
  const uiRoot = document.querySelector('#spatial-ui-root');
  const loadingOverlay = document.querySelector('#ui-loading');
  
  // Backdrop layers for fade-in / fade-out animations
  const leftBackdrop = document.querySelector('#panel-left-backdrop');
  const centerBackdrop = document.querySelector('#panel-center-backdrop');
  const rightBackdrop = document.querySelector('#panel-right-backdrop');
  const statusBadgeBg = document.querySelector('#badge-status-bg');

  // Troika-text entities - Left Panel (Profile)
  const txtName = document.querySelector('#txt-name');
  const txtDob = document.querySelector('#txt-dob');
  const txtBg = document.querySelector('#txt-bg');
  const txtVehicle = document.querySelector('#txt-vehicle');
  const txtLic = document.querySelector('#txt-lic');
  const txtStatus = document.querySelector('#txt-status');

  // Troika-text entities - Right Panel (Welfare)
  const txtCampaign = document.querySelector('#txt-campaign');
  const txtBenefits = document.querySelector('#txt-benefits');
  const txtEmergency = document.querySelector('#txt-emergency');

  // Cache state to avoid refetching on every track loss/find
  let profileDataLoaded = false;
  let isTrackingActive = false;
  let hideTimeout = null;

  /**
   * Helper function to safely set troika-text values
   */
  function setTroikaText(el, text) {
    if (!el) return;
    el.setAttribute('troika-text', Object.assign({}, el.getAttribute('troika-text') || {}, {
      value: text
    }));
  }

  /**
   * Helper function to populate UI with Driver profile JSON payload
   */
  function populateUI(data) {
    console.log('[UI] Populating troika-text entities with driver data:', data);
    
    // 1. Left Panel (Driver Personal & Professional)
    setTroikaText(txtName, `Name: ${data.personal_info.name}`);
    setTroikaText(txtDob, `DOB: ${data.personal_info.dob}`);
    setTroikaText(txtBg, `Blood Group: ${data.personal_info.blood_group}`);
    setTroikaText(txtVehicle, `Vehicle: ${data.professional_info.vehicle_type}`);
    setTroikaText(txtLic, `License: ${data.professional_info.license_no} (Exp: ${data.professional_info.validity})`);
    
    // Status Tag Styling & Text
    const statusUpper = (data.status || 'ACTIVE').toUpperCase();
    setTroikaText(txtStatus, statusUpper);
    if (statusBadgeBg) {
      const color = statusUpper === 'ACTIVE' ? '#059669' : '#DC2626';
      statusBadgeBg.setAttribute('material', 'color', color);
    }

    // 2. Right Panel (Welfare Board Campaigns & Contacts)
    setTroikaText(txtCampaign, data.welfare_board_data.latest_campaign);
    
    const benefitsList = data.welfare_board_data.benefits_active
      .map(benefit => `• ${benefit}`)
      .join('\n');
    setTroikaText(txtBenefits, benefitsList);

    const emergencyDetails = `Helpline: ${data.welfare_board_data.emergency_contacts.general}\nDirect: ${data.welfare_board_data.emergency_contacts.personal}`;
    setTroikaText(txtEmergency, emergencyDetails);
  }

  // --- MindAR Event Listeners ---

  // When ID card target is recognized
  cardTarget.addEventListener('targetFound', async () => {
    console.log('[AR] Target Found - Initiating Vision Pro Transition');
    isTrackingActive = true;
    
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // 1. Hide HUD Scanning Overlay
    loadingOverlay.classList.add('hidden');

    // 2. Make spatial root visible
    uiRoot.setAttribute('visible', 'true');

    // 3. Trigger coordinated A-Frame smooth entry animations (fade in 0 -> 0.6, scale 0.8 -> 1.0)
    uiRoot.emit('animate-in');
    leftBackdrop.emit('animate-in');
    centerBackdrop.emit('animate-in');
    rightBackdrop.emit('animate-in');

    // 4. Fetch dynamic profile data if not cached
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

  // When ID card tracking is lost
  cardTarget.addEventListener('targetLost', () => {
    console.log('[AR] Target Lost - Initiating Smooth 300ms Fade-Out');
    isTrackingActive = false;

    // 1. Trigger graceful fade out and scale down animations
    uiRoot.emit('animate-out');
    leftBackdrop.emit('animate-out');
    centerBackdrop.emit('animate-out');
    rightBackdrop.emit('animate-out');

    // 2. Wait for 300ms animation to finish before hiding root and restoring scanning HUD
    hideTimeout = setTimeout(() => {
      if (!isTrackingActive) {
        uiRoot.setAttribute('visible', 'false');
        loadingOverlay.classList.remove('hidden');
      }
    }, 300);
  });
});
