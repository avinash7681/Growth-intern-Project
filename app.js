// NxtWave Growth Challenge — Application State & Interactive Logic
const AppState = {
  backendConnected: false,
  activeTab: 'landing',
  totalRegistrations: 518,
  targetRegistrations: 500,
  currentUser: {
    name: 'A. Avinash',
    college: 'Amrita Vishwa Vidyapeetham',
    branch: 'Computer Science & Engineering (Final Year)',
    phone: '+91 98765 43210',
    referralCode: 'AVINASH-AI26',
    referralCount: 3,
    unlockedTiers: [1, 2]
  },
  registeredList: [
    { name: 'Kavya S.', college: 'Amrita Vishwa Vidyapeetham (Coimbatore)', time: '1 min ago', branch: 'AI & Data Science' },
    { name: 'Aditya P.', college: 'SRM Institute of Science and Tech', time: '3 mins ago', branch: 'CSE' },
    { name: 'Sneha M.', college: 'Chaitanya Bharathi Institute (CBIT)', time: '6 mins ago', branch: 'ECE' },
    { name: 'Karthik R.', college: 'Amrita Vishwa Vidyapeetham (Amritapuri)', time: '12 mins ago', branch: 'CSE' },
    { name: 'Pooja Nair', college: 'PSG College of Technology', time: '18 mins ago', branch: 'AI & DS' },
    { name: 'Vikas Kumar', college: 'KIET Group of Institutions (AKTU)', time: '24 mins ago', branch: 'CSE' }
  ],
  ambassadors: [
    { name: 'Arjun Menon', college: 'Amrita Vishwa Vidyapeetham (Coimbatore)', referrals: 68, prize: '₹400 Amazon Voucher + Certificate' },
    { name: 'Siddharth V.', college: 'JNTU Hyderabad', referrals: 64, prize: '₹400 Amazon Voucher + Certificate' },
    { name: 'Ananya Deshmukh', college: 'COEP Pune', referrals: 52, prize: '₹400 Amazon Voucher + Certificate' },
    { name: 'Gowtham K.', college: 'Anna University Guindy', referrals: 48, prize: '₹400 Amazon Voucher + Certificate' },
    { name: 'Pritam Ghosh', college: 'Heritage Institute Kolkata', referrals: 41, prize: '₹400 Amazon Voucher + Certificate' },
    { name: 'Divya R.', college: 'Amrita Vishwa Vidyapeetham (Bengaluru)', referrals: 38, prize: 'NxtWave Community Lead' }
  ]
};

// Check Backend Connection on Load
async function checkBackendConnection() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      AppState.backendConnected = true;
      updateBackendStatusBadge(true, `Backend: Flask + SQLite Online (${data.database_records} DB Records)`);
      fetchLiveStats();
    } else {
      updateBackendStatusBadge(false, 'Backend: Offline (Client Mode Active)');
    }
  } catch (e) {
    updateBackendStatusBadge(false, 'Mode: Standalone Browser Mode');
  }
}

function updateBackendStatusBadge(online, text) {
  const pill = document.getElementById('backend-status-pill');
  if (!pill) return;
  if (online) {
    pill.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm';
    pill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>${text}</span>`;
  } else {
    pill.className = 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700 flex items-center gap-1.5';
    pill.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>${text}</span>`;
  }
}

// Fetch Live Stats from Backend
async function fetchLiveStats() {
  if (!AppState.backendConnected) return;
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      AppState.totalRegistrations = data.total_registrations;
      AppState.targetRegistrations = data.target_registrations;
      if (data.ambassadors && data.ambassadors.length > 0) {
        AppState.ambassadors = data.ambassadors;
      }
      updateUIMetrics();
    }
  } catch (e) {
    console.log('Using local stats');
  }
}

// Tab Switching
function switchTab(tabId) {
  AppState.activeTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update navigation styling
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-lg');
      btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg');
      btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open Quick Register Modal / Scroll
function triggerRegister() {
  switchTab('tab-landing');
  const regForm = document.getElementById('registration-section');
  if (regForm) {
    regForm.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('reg-name').focus();
  }
}

// Handle Form Submission (Connects to Backend POST /api/register)
async function handleRegistrationSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const college = document.getElementById('reg-college').value.trim();
  const branch = document.getElementById('reg-branch').value;

  if (!name || !phone || !college) {
    alert('Please fill out all required fields.');
    return;
  }

  let refCode = '';

  if (AppState.backendConnected) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, college, branch })
      });
      if (res.ok) {
        const result = await res.json();
        refCode = result.student.referral_code;
        showToast(`🎉 Registration saved to SQLite backend for ${name}!`);
      }
    } catch (e) {
      console.log('Backend fallback to client generation');
    }
  }

  if (!refCode) {
    const cleanInitials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'NXT';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    refCode = `${cleanInitials}-AI${randNum}`;
    showToast(`🎉 Registration Confirmed for ${name}!`);
  }

  AppState.currentUser = {
    name,
    phone,
    email,
    college,
    branch,
    referralCode: refCode,
    referralCount: 0,
    unlockedTiers: []
  };

  AppState.totalRegistrations += 1;
  updateUIMetrics();

  // Add to recent feed
  AppState.registeredList.unshift({
    name: name,
    college: college,
    time: 'Just now',
    branch: branch
  });
  renderRecentFeed();

  // Auto redirect to referral tab
  setTimeout(() => {
    switchTab('tab-referral');
    updateReferralUI();
  }, 800);
}

// Simulate Referral (+1 friend) - Connects to Backend POST /api/referrals/simulate
async function simulateReferralAdd() {
  if (AppState.backendConnected) {
    try {
      const res = await fetch('/api/referrals/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: AppState.currentUser.referralCode })
      });
      if (res.ok) {
        const data = await res.json();
        AppState.currentUser.referralCount = data.referral_count;
        AppState.currentUser.unlockedTiers = data.unlocked_tiers;
        AppState.totalRegistrations += 1;
        showToast(`🏆 ${data.simulated_friend} from ${data.friend_college} joined! Total: ${data.referral_count}`);
        updateReferralUI();
        updateUIMetrics();
        return;
      }
    } catch (e) {
      console.log('Fallback to local simulation');
    }
  }

  // Local fallback
  AppState.currentUser.referralCount += 1;
  AppState.totalRegistrations += 1;
  
  const count = AppState.currentUser.referralCount;
  if (count >= 1 && !AppState.currentUser.unlockedTiers.includes(1)) {
    AppState.currentUser.unlockedTiers.push(1);
    showToast('🏆 Milestone Unlocked! You earned Tier 1: AI Resume Cheatsheet.');
  }
  if (count >= 3 && !AppState.currentUser.unlockedTiers.includes(2)) {
    AppState.currentUser.unlockedTiers.push(2);
    showToast('🚀 Milestone Unlocked! You earned Tier 2: 5 Production AI Project Blueprints.');
  }
  if (count >= 5 && !AppState.currentUser.unlockedTiers.includes(3)) {
    AppState.currentUser.unlockedTiers.push(3);
    showToast('👑 VIP Tier Unlocked! VIP 1-on-1 Mentor Slot + Verified Certificate Badge.');
  }

  updateReferralUI();
  updateUIMetrics();
}

// Update Referral UI & Tier Status
function updateReferralUI() {
  const user = AppState.currentUser;
  const count = user.referralCount;

  const codeEl = document.getElementById('ref-code-display');
  const linkEl = document.getElementById('ref-link-display');
  const countEl = document.getElementById('ref-count-number');
  const userGreetingEl = document.getElementById('ref-user-greeting');

  if (codeEl) codeEl.innerText = user.referralCode;
  if (linkEl) linkEl.value = `https://nxtwave.in/ai60?ref=${user.referralCode}`;
  if (countEl) countEl.innerText = count;
  if (userGreetingEl) userGreetingEl.innerText = `${user.name} (${user.college})`;

  // Progress Bar
  const progressBar = document.getElementById('referral-progress-fill');
  if (progressBar) {
    const percent = Math.min(100, Math.round((count / 5) * 100));
    progressBar.style.width = `${percent}%`;
    progressBar.innerText = `${count} / 5 Friends Joined (${percent}%)`;
  }

  // Tier 1 Check
  const tier1Card = document.getElementById('tier-1-card');
  const tier1Btn = document.getElementById('tier-1-btn');
  if (tier1Card && tier1Btn) {
    if (count >= 1) {
      tier1Card.className = 'glass-panel p-5 border-2 border-emerald-500 bg-emerald-950/20 rounded-xl relative';
      tier1Btn.className = 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center gap-1 cursor-pointer';
      tier1Btn.innerHTML = '✓ Download Resume Cheatsheet';
      tier1Btn.onclick = () => openAssetModal('tier1');
    }
  }

  // Tier 2 Check
  const tier2Card = document.getElementById('tier-2-card');
  const tier2Btn = document.getElementById('tier-2-btn');
  if (tier2Card && tier2Btn) {
    if (count >= 3) {
      tier2Card.className = 'glass-panel p-5 border-2 border-cyan-500 bg-cyan-950/20 rounded-xl relative';
      tier2Btn.className = 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-black flex items-center justify-center gap-1 cursor-pointer';
      tier2Btn.innerHTML = '✓ Access 5 Project Blueprints';
      tier2Btn.onclick = () => openAssetModal('tier2');
    }
  }

  // Tier 3 Check
  const tier3Card = document.getElementById('tier-3-card');
  const tier3Btn = document.getElementById('tier-3-btn');
  if (tier3Card && tier3Btn) {
    if (count >= 5) {
      tier3Card.className = 'glass-panel p-5 border-2 border-amber-500 bg-amber-950/20 rounded-xl relative';
      tier3Btn.className = 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center gap-1 cursor-pointer';
      tier3Btn.innerHTML = '✓ Claim VIP Mentor Pass';
      tier3Btn.onclick = () => openAssetModal('tier3');
    }
  }
}

// Copy Referral Link
function copyReferralLink() {
  const linkEl = document.getElementById('ref-link-display');
  if (linkEl) {
    navigator.clipboard.writeText(linkEl.value).then(() => {
      showToast('📋 Referral link copied to clipboard!');
    }).catch(() => {
      showToast('Link: ' + linkEl.value);
    });
  }
}

// Open WhatsApp Share with prefilled text
function shareOnWhatsApp() {
  const code = AppState.currentUser.referralCode;
  const msg = encodeURIComponent(
    `🚀 Hey batchmates! NxtWave is hosting a FREE 60-minute live workshop: "Build Your First AI Project in 60 Mins" with real code and GitHub repo for our placement resumes.\n\n` +
    `I just registered my seat. Register using my link so we both unlock the 2026 AI Placement Project Vault for free!\n\n` +
    `👉 Register here: https://nxtwave.in/ai60?ref=${code}`
  );
  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

// Asset Modal
function openAssetModal(type) {
  const modal = document.getElementById('reward-asset-modal');
  const modalTitle = document.getElementById('modal-asset-title');
  const modalBody = document.getElementById('modal-asset-content');

  if (type === 'tier1') {
    modalTitle.innerText = '📄 Tier 1 Unlocked: 2026 AI Placement Resume Cheatsheet';
    modalBody.innerHTML = `
      <div class="space-y-4 text-sm text-slate-300">
        <p class="text-emerald-400 font-semibold">Here are 3 verified STAR-format bullet points for your resume:</p>
        <div class="p-3 bg-slate-900 rounded-lg border border-slate-700 font-mono text-xs">
          • Architected an end-to-end Generative AI document copilot leveraging open-source LLMs and semantic embeddings, cutting query latency by 64%.<br><br>
          • Integrated Retrieval-Augmented Generation (RAG) pipeline with FAISS vector store, eliminating hallucination rates down to <3% across 1,000+ domain docs.<br><br>
          • Deployed production-grade FastAPI microservices on Vercel/Render with automated CI/CD and rate-limiting middleware.
        </div>
        <p class="text-xs text-slate-400">💡 Tip: Highlight the exact latency, accuracy metric, and cloud deployment in your technical interview.</p>
      </div>
    `;
  } else if (type === 'tier2') {
    modalTitle.innerText = '🏗️ Tier 2 Unlocked: 5 Production AI Project Blueprints';
    modalBody.innerHTML = `
      <div class="space-y-3 text-sm text-slate-300">
        <p class="text-cyan-400 font-semibold">5 Complete Capstone Architectures for Final-Year Submissions:</p>
        <ul class="list-disc pl-5 space-y-2 text-xs">
          <li><strong class="text-white">1. Multi-Agent Code Review Bot:</strong> Autonomous code vulnerability detector using LangGraph & Gemini Flash.</li>
          <li><strong class="text-white">2. Multimodal AI Medical Report Explainer:</strong> OCR + Vision LLM explaining clinical lab reports in simple regional languages.</li>
          <li><strong class="text-white">3. Real-Time Voice AI Interviewer:</strong> Low-latency WebRTC conversational bot assessing system design fundamentals.</li>
          <li><strong class="text-white">4. Predictive IoT Fault Detection:</strong> Edge ML anomaly detection running on ESP32/Raspberry Pi for mechanical assemblies.</li>
          <li><strong class="text-white">5. Autonomous SQL Assistant:</strong> Natural language to SQL query engine with schema pruning and guardrails.</li>
        </ul>
      </div>
    `;
  } else if (type === 'tier3') {
    modalTitle.innerText = '👑 Tier 3 Unlocked: VIP Mentor Pass & Certificate Badge';
    modalBody.innerHTML = `
      <div class="space-y-3 text-sm text-slate-300">
        <div class="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-xs">
          🎉 <strong>VIP Access Granted!</strong> Your referral count placed you in the Top 5% of registrants.
        </div>
        <p class="text-xs">• <strong>Priority Live Q&A:</strong> Your project question will be answered live by the NxtWave Tech Lead during the 60-min session.</p>
        <p class="text-xs">• <strong>Verified Completion Badge:</strong> High-resolution LinkedIn banner and digital credential badge.</p>
        <p class="text-xs">• <strong>1-on-1 Code Review:</strong> Submit your GitHub repo post-workshop for a direct review by an engineer.</p>
      </div>
    `;
  }

  modal.classList.remove('hidden');
}

function closeAssetModal() {
  document.getElementById('reward-asset-modal').classList.add('hidden');
}

// WhatsApp Simulator Script Stages
const waStages = {
  1: {
    title: 'Touchpoint 1: Instant Confirmation (T = 0m)',
    desc: 'Sent immediately within 15 seconds of web registration.',
    messages: [
      { type: 'bot', text: '🎉 *Registration Confirmed, Avinash!*\n\nYou are locked in for NxtWave\'s live online workshop:\n\n*\"Build Your First AI Project in 60 Minutes\"*\n\n📅 Date: Saturday, 7:00 PM IST\n🔗 Zoom/YouTube link will be shared here 15 mins prior.\n\n👇 *Add to Calendar (1-Click):*\n<a href="/api/calendar.ics" class="wa-interactive-btn inline-block">📅 Download Calendar Invite (.ics)</a>', time: '7:01 PM' },
      { type: 'bot', text: '🎁 *Bonus Challenge:* Want the *\"2026 AI Placement Resume Cheatsheet\"* for free?\n\nInvite 1 friend from your college using your personal link:\n👉 https://nxtwave.in/ai60?ref=AVINASH-AI26\n\nReply *YES* if you have any questions!', time: '7:02 PM' }
    ]
  },
  2: {
    title: 'Touchpoint 2: Referral Nudge & FOMO (T = 24h)',
    desc: 'Sent on Day 2 to trigger viral sharing before batch fills up.',
    messages: [
      { type: 'bot', text: '🔥 *Update:* 342 final-year students from Amrita Vishwa Vidyapeetham, VIT, and SRM have already joined the workshop batch!\n\nOnly *158 seats left* before registration locks.\n\nHave you shared your link with your project partners?\nWhen 3 friends join, you instantly unlock the *\"5 Production AI Capstone Blueprints\"*.\n\n👉 Track your invites: https://nxtwave.in/ai60/tracker?ref=AVINASH-AI26', time: '11:15 AM' }
    ]
  },
  3: {
    title: 'Touchpoint 3: Pre-Workshop Prep Checklist (T-24h)',
    desc: 'Sent 24 hours before the workshop to guarantee zero drop-off.',
    messages: [
      { type: 'bot', text: '⚡ *Workshop Tomorrow at 7:00 PM! Quick 2-Minute Setup:*\n\nTo make sure you build and deploy your AI project within 60 minutes with zero lag:\n\n1️⃣ Keep a Google Chrome browser open (laptop recommended).\n2️⃣ Sign up for a free HuggingFace / OpenRouter account (takes 30 seconds).\n3️⃣ Zero software installation needed! Everything runs in the cloud.\n\nReady to build? React with 🚀 to this message!', time: '6:30 PM' },
      { type: 'user', text: '🚀 Super excited! Ready!', time: '6:35 PM' },
      { type: 'bot', text: 'Awesome! See you tomorrow at 7 PM sharp. You will leave with a live GitHub link on your resume.', time: '6:36 PM' }
    ]
  },
  4: {
    title: 'Touchpoint 4: Live Join Link & Urgency (T-15m)',
    desc: 'Sent 15 minutes before broadcast to maximize attendance rate.',
    messages: [
      { type: 'bot', text: '🔴 *WE ARE GOING LIVE IN 15 MINUTES!*\n\nThe workshop room is now open. Join early to secure your spot—the session is capped at 500 live participants.\n\n👇 *Click Here to Join Live:*\nhttps://live.nxtwave.in/room/ai60-finalyear\n\nHave your notebook ready—we start building in 15 mins!', time: '6:45 PM' }
    ]
  }
};

function selectWhatsAppStage(stageNum) {
  const stage = waStages[stageNum];
  if (!stage) return;

  document.querySelectorAll('.wa-stage-pill').forEach(btn => {
    if (parseInt(btn.dataset.stage) === stageNum) {
      btn.classList.add('bg-emerald-500', 'text-black', 'font-bold');
      btn.classList.remove('bg-slate-800', 'text-slate-300');
    } else {
      btn.classList.remove('bg-emerald-500', 'text-black', 'font-bold');
      btn.classList.add('bg-slate-800', 'text-slate-300');
    }
  });

  const titleEl = document.getElementById('wa-stage-title');
  const descEl = document.getElementById('wa-stage-desc');
  if (titleEl) titleEl.innerText = stage.title;
  if (descEl) descEl.innerText = stage.desc;

  const chatContainer = document.getElementById('wa-chat-container');
  if (chatContainer) {
    chatContainer.innerHTML = '';
    stage.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = msg.type === 'bot' ? 'bubble-received' : 'bubble-sent';
      bubble.innerHTML = `
        <div>${msg.text.replace(/\n/g, '<br>')}</div>
        <div class="bubble-timestamp">${msg.time} ${msg.type === 'bot' ? '✓✓' : ''}</div>
      `;
      chatContainer.appendChild(bubble);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// AI Project & Resume Copilot Logic (Connects to Backend POST /api/evaluate-project)
const projectPresets = {
  cse_attendance: {
    title: 'Smart Attendance System using OpenCV / Haar Cascade',
    branch: 'Computer Science / IT',
    score: 34,
    critique: 'Generic 2018 project found on 10,000+ student resumes. Uses outdated Haar cascades with high false-positive rates and zero LLM or cloud API integration. Immediate red flag for product recruiters.',
    reimaginedTitle: 'Edge Multimodal AI Proctor & Attendance Engine with Vector Verification',
    overhaul: 'Modernize with FaceNet vector embeddings (128-d) stored in a lightweight SQLite/Milvus vector index + Whisper audio anomaly detection for remote proctoring.',
    techStack: 'FastAPI, FaceNet, Google Gemini Flash API, Milvus Lite, Streamlit',
    bullets: [
      'Engineered an edge-compatible biometric verification service using 128-dimensional facial embedding vectors, achieving 99.2% accuracy under variable lighting conditions.',
      'Constructed automated anti-spoofing heuristic filters and multi-modal audio proctoring, reducing false-positive classroom attendance records by 88%.',
      'Deployed asynchronous microservice via FastAPI and Docker, handling concurrent batch verification for 150+ student streams with <120ms latency.'
    ]
  },
  cse_rag: {
    title: 'Basic PDF Text Extractor / Simple PyPDF Summarizer',
    branch: 'Computer Science / AI-DS',
    score: 42,
    critique: 'Naive text extraction followed by standard string truncation. Fails when documents exceed context windows; lacks semantic retrieval, re-ranking, and citation provenance.',
    reimaginedTitle: 'Autonomous Enterprise Multi-Doc RAG Copilot with Hybrid Search & Guardrails',
    overhaul: 'Recursive character chunking + hybrid BM25 and dense embeddings (BGE-small) + cross-encoder re-ranking + LangChain guardrails to eliminate hallucination.',
    techStack: 'LangChain / LlamaIndex, ChromaDB, Cohere Re-rank, FastAPI, Next.js',
    bullets: [
      'Built a production-ready Retrieval-Augmented Generation (RAG) copilot querying 1,000+ multi-format technical documents with verifiable citation links.',
      'Implemented hybrid retrieval (BM25 sparse + dense vector embeddings) and cross-encoder re-ranking, boosting retrieval precision (MRR@5) from 0.61 to 0.92.',
      'Architected streaming SSE response pipeline in FastAPI with sub-800ms Time-to-First-Token and automated PII redaction guardrails.'
    ]
  },
  ece_iot: {
    title: 'Arduino Temperature & Humidity Alert System via GSM / SMS',
    branch: 'Electronics & Communication (ECE) / IoT',
    score: 38,
    critique: 'Basic threshold-based sensor reading with static if/else logic. Offers zero predictive intelligence or anomaly forecasting.',
    reimaginedTitle: 'TinyML Predictive Maintenance & Thermal Anomaly Detection on Edge MCU',
    overhaul: 'Deploy a quantized neural network (TensorFlow Lite for Microcontrollers) directly onto an ESP32 or STM32 MCU for real-time vibration/thermal anomaly classification without cloud latency.',
    techStack: 'ESP32, TinyML, TensorFlow Lite for Microcontrollers, MQTT, InfluxDB',
    bullets: [
      'Quantized and deployed a 4-layer autoencoder model (8-bit integer) on ESP32 microcontroller with <35KB RAM consumption and 12ms inference latency.',
      'Achieved 96.4% recall in early detection of mechanical bearing anomalies 48 hours prior to threshold-based alert triggers.',
      'Built low-power MQTT telemetry client operating on deep sleep cycles, extending remote sensor battery life by 3.2x.'
    ]
  }
};

function loadPresetCopilot(key) {
  const p = projectPresets[key];
  if (!p) return;
  document.getElementById('copilot-input-title').value = p.title;
  document.getElementById('copilot-input-branch').value = p.branch;
  evaluateProject(p);
}

async function evaluateCustomProject() {
  const title = document.getElementById('copilot-input-title').value.trim();
  const branch = document.getElementById('copilot-input-branch').value;

  if (!title) {
    alert('Please enter a project title or select one of the quick presets.');
    return;
  }

  // Call Backend API if connected
  if (AppState.backendConnected) {
    try {
      showToast('⚡ Evaluating with Flask AI engine...');
      const res = await fetch('/api/evaluate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, branch })
      });
      if (res.ok) {
        const data = await res.json();
        evaluateProject(data);
        showToast('✓ Project evaluated & stored in SQLite database!');
        return;
      }
    } catch (e) {
      console.log('Backend fallback to client evaluation');
    }
  }

  // Local fallback
  const isAI = /ai|gpt|llm|rag|deep|neural|vision|embedding/i.test(title);
  const score = isAI ? Math.floor(65 + Math.random() * 25) : Math.floor(30 + Math.random() * 20);

  const customObj = {
    title: title,
    branch: branch,
    score: score,
    critique: isAI 
      ? 'Strong modern direction, but requires concrete quantifiable metrics (latency, accuracy, scale) and production deployment architecture to stand out to senior engineering interviewers.'
      : 'Classical architecture relies on static rules and monolithic code. Top product recruiters look for modern AI integration (APIs, RAG, agentic workflows) and deployment.',
    reimaginedTitle: `Next-Gen AI-Powered ${title.replace(/using.*/i, '')} Copilot`,
    overhaul: `Upgrade system with lightweight LLM agent orchestration, vector knowledge retrieval, and automated cloud CI/CD deployment.`,
    techStack: 'Python 3.11, OpenRouter / Groq API, LangChain, FastAPI, Docker',
    bullets: [
      `Designed and deployed an AI-augmented pipeline for ${title}, reducing end-to-end processing turnaround time by 65%.`,
      `Integrated asynchronous LLM streaming and schema validation with structured JSON outputs, ensuring 99.8% reliability against malformed responses.`,
      `Documented full system architecture on GitHub with automated testing suite and Dockerized container deployment on cloud infrastructure.`
    ]
  };

  evaluateProject(customObj);
}

function evaluateProject(data) {
  const resultsCard = document.getElementById('copilot-results');
  resultsCard.classList.remove('hidden');

  const scoreEl = document.getElementById('copilot-score');
  scoreEl.innerText = `${data.score}/100`;
  scoreEl.className = data.score > 60 
    ? 'text-3xl font-extrabold text-emerald-400' 
    : 'text-3xl font-extrabold text-amber-400';

  document.getElementById('copilot-critique').innerText = data.critique;
  document.getElementById('copilot-reimagined').innerText = data.reimaginedTitle;
  document.getElementById('copilot-overhaul').innerText = data.overhaul;
  document.getElementById('copilot-stack').innerText = data.techStack;

  const bulletsContainer = document.getElementById('copilot-bullets');
  bulletsContainer.innerHTML = '';
  data.bullets.forEach((bullet) => {
    const li = document.createElement('li');
    li.className = 'p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono flex items-start justify-between gap-2';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'flex-1';
    textSpan.innerHTML = `<span class="text-indigo-400 font-bold select-none mr-2">•</span>${bullet}`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'text-slate-400 hover:text-white text-[10px] uppercase font-sans tracking-wide bg-slate-800 px-2 py-1 rounded cursor-pointer whitespace-nowrap';
    copyBtn.innerText = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(bullet);
      showToast('✓ Resume bullet copied to clipboard!');
    };

    li.appendChild(textSpan);
    li.appendChild(copyBtn);
    bulletsContainer.appendChild(li);
  });

  resultsCard.scrollIntoView({ behavior: 'smooth' });
}

// Update Top Metrics UI
function updateUIMetrics() {
  const total = AppState.totalRegistrations;
  const target = AppState.targetRegistrations;

  const countEl = document.getElementById('header-reg-count');
  if (countEl) countEl.innerText = `${total} / ${target}`;

  const heroCountEl = document.getElementById('hero-reg-count');
  if (heroCountEl) heroCountEl.innerText = total;

  const anTotal = document.getElementById('an-total-reg');
  if (anTotal) anTotal.innerText = total;

  const anGoalPct = document.getElementById('an-goal-pct');
  if (anGoalPct) anGoalPct.innerText = `${Math.round((total / target) * 100)}%`;
}

// Recent Feed
function renderRecentFeed() {
  const feed = document.getElementById('recent-feed-container');
  if (!feed) return;
  feed.innerHTML = '';
  AppState.registeredList.slice(0, 6).forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between text-xs py-2 border-b border-slate-800/80';
    row.innerHTML = `
      <div>
        <span class="text-white font-semibold">${item.name}</span>
        <span class="text-slate-400 ml-1">(${item.branch})</span>
        <div class="text-[11px] text-slate-500">${item.college}</div>
      </div>
      <span class="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded">${item.time}</span>
    `;
    feed.appendChild(row);
  });
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 4000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  checkBackendConnection();
  updateUIMetrics();
  renderRecentFeed();
  updateReferralUI();
  selectWhatsAppStage(1);
});
