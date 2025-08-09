/*****************************************
 * main.js - Fixed modal flow (TopUp + Transfer) + Confetti Fix
 *****************************************/

/* --- DOM elements --- */
const openButtons = document.querySelectorAll('.open');
const closeButtons = document.querySelectorAll('.close');

const modalContent = {
  accountCheck: document.querySelector('#modal-content--account-check'),
  searchContact: document.querySelector('#modal-content--search-contact'),
  inputNominal: document.querySelector('#modal-content--input-nominal'),
  validatePin: document.querySelector('#modal-content--validate-pin'),
  successTransfer: document.querySelector('#modal-content--success-transfer'),
};

const buttonBackModalContent = document.querySelector('#button-back-modal-content');

/* Topup elements */
const topupForm = document.querySelector('#modal-topup form');
const topupStep2 = document.querySelector('#topup-step-2');
const topupStep3 = document.querySelector('#topup-step-3');
const btnTopup = topupForm ? topupForm.querySelector('button') : null;
const btnCekPembayaran = document.querySelector('#btn-cek-pembayaran');
const btnKembaliDashboard = document.querySelector('#btn-kembali-dashboard');

/* Transfer helper selectors */
const btnValidatePin = document.querySelector('#btn-validate-pin');
const btnKembaliDashboardTransfer = document.querySelector('#btn-kembali-dashboard-transfer');

/* --- Utilities --- */
function toggleModalContent(showKey) {
  Object.keys(modalContent).forEach((key) => {
    const el = modalContent[key];
    if (!el) return;
    if (key === showKey) {
      el.classList.add('flex');
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });
}

function updateBackButtonVisibility() {
  if (!buttonBackModalContent) return;
  if (buttonBackModalContent.classList.contains('hidden')) return;
  const dataHistory = JSON.parse(buttonBackModalContent.getAttribute('data-history-back') || '[]');
  if (dataHistory.length > 0) {
    buttonBackModalContent.classList.remove('invisible');
  } else {
    buttonBackModalContent.classList.add('invisible');
  }
}

function pushBackHistory(modalContentKey) {
  if (!buttonBackModalContent) return;
  const raw = buttonBackModalContent.getAttribute('data-history-back') || '[]';
  const dataHistory = JSON.parse(raw);
  dataHistory.push(modalContentKey);
  buttonBackModalContent.setAttribute('data-history-back', JSON.stringify(dataHistory));
  updateBackButtonVisibility();
}

/* Show helpers for transfer flow */
function showAccountCheck() { toggleModalContent('accountCheck'); pushBackHistory('modal-content--account-check'); }
function showSearchContact() { toggleModalContent('searchContact'); pushBackHistory('modal-content--search-contact'); }
function showInputNominal() { toggleModalContent('inputNominal'); pushBackHistory('modal-content--input-nominal'); }
function showValidatePin() { toggleModalContent('validatePin'); pushBackHistory('modal-content--validate-pin'); }
function showSuccessTransfer() {
  toggleModalContent('successTransfer');
  document.querySelector('#modal-transfer .close')?.classList.add('hidden');
  document.querySelector('#modal-transfer #button-back-modal-content')?.classList.add('hidden');
}

/* Close modal with animation */
function closeModalWithAnimation(el, afterClosedCallback) {
  if (!el) {
    if (typeof afterClosedCallback === 'function') afterClosedCallback();
    return;
  }
  el.classList.remove('animate-slide-top');
  el.classList.add('animate-slide-bottom');
  setTimeout(() => {
    try { el.close(); } catch {}
    if (typeof afterClosedCallback === 'function') afterClosedCallback();
  }, 650);
}

/* --- Open / Close button handlers --- */
openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const idModalTarget = button.getAttribute('data-modal-target');
    const modalTarget = document.getElementById(idModalTarget);

    if (idModalTarget === 'modal-topup') {
      topupForm?.classList.remove('hidden');
      topupForm?.classList.add('flex');
      topupStep2?.classList.add('hidden');
      topupStep3?.classList.add('hidden');
      modalTarget.querySelector('.close')?.classList.remove('hidden');
    }

    if (idModalTarget === 'modal-transfer') {
      toggleModalContent('accountCheck');
      const closeBtn = modalTarget.querySelector('.close');
      const backBtn = modalTarget.querySelector('#button-back-modal-content');
      if (closeBtn) closeBtn.classList.remove('hidden');
      if (backBtn) {
        backBtn.classList.remove('hidden');
        backBtn.classList.add('invisible');
        backBtn.setAttribute('data-history-back', '[]');
      }
      updateBackButtonVisibility();
    }

    modalTarget.classList.remove('animate-slide-bottom');
    modalTarget.classList.add('animate-slide-top');
    modalTarget.showModal();
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const modalTarget = document.getElementById(button.getAttribute('data-modal-target'));
    closeModalWithAnimation(modalTarget);
  });
});

/* --- Back button handler (transfer) --- */
buttonBackModalContent?.addEventListener('click', () => {
  const dataHistory = JSON.parse(buttonBackModalContent.getAttribute('data-history-back') || '[]');
  const elTarget = dataHistory.pop();
  switch (elTarget) {
    case 'modal-content--validate-pin': showInputNominal(); break;
    case 'modal-content--input-nominal': showSearchContact(); break;
    case 'modal-content--search-contact': showAccountCheck(); break;
  }
  buttonBackModalContent.setAttribute('data-history-back', JSON.stringify(dataHistory));
  updateBackButtonVisibility();
});

/* --- Balance visibility --- */
function handleChangeVisibility(elBalance, elBtn) {
  const balanceValue = elBalance.getAttribute('data-balance-value');
  const isShown = elBalance.getAttribute('data-show-balance');
  const currentIsShown = isShown === 'true' ? 'false' : 'true';
  elBalance.setAttribute('data-show-balance', currentIsShown);
  if (currentIsShown !== 'true') {
    elBalance.innerHTML = '*********';
    elBtn.classList.replace('i-material-symbols-visibility', 'i-material-symbols-visibility-off');
  } else {
    elBalance.innerHTML = balanceValue;
    elBtn.classList.replace('i-material-symbols-visibility-off', 'i-material-symbols-visibility');
  }
}
document.getElementById('visibilityButton')?.addEventListener('click', function () {
  handleChangeVisibility(document.getElementById('balance'), this);
});

/* --- TOP UP FLOW --- */
btnTopup?.addEventListener('click', () => {
  topupForm.classList.add('hidden');
  topupStep2.classList.remove('hidden');
  topupStep2.classList.add('flex');
});

btnCekPembayaran?.addEventListener('click', () => {
  topupStep2.classList.add('hidden');
  topupStep3.classList.remove('hidden');
  topupStep3.classList.add('flex');
  document.querySelector('#modal-topup .close')?.classList.add('hidden');
  
});

btnKembaliDashboard?.addEventListener('click', () => {
  closeModalWithAnimation(document.getElementById('modal-topup'), () => {
    topupStep3?.classList.add('hidden');
    topupStep2?.classList.add('hidden');
    if (topupForm) {
      topupForm.classList.remove('hidden');
      topupForm.classList.add('flex');
      topupForm.reset?.();
    }
    document.querySelector('#modal-topup .close')?.classList.add('hidden');
    showTopupSuccessAnimation();
  });
});

/* --- TRANSFER FLOW --- */
document.querySelector('#modal-content--input-nominal button')?.addEventListener('click', showValidatePin);
btnValidatePin?.addEventListener('click', () => {showSuccessTransfer();});
btnKembaliDashboardTransfer?.addEventListener('click', () => {
  closeModalWithAnimation(document.getElementById('modal-transfer'), () => {
    toggleModalContent('accountCheck');
    const backBtn = document.querySelector('#modal-transfer #button-back-modal-content');
    if (backBtn) {
      backBtn.classList.remove('hidden');
      backBtn.classList.add('invisible');
      backBtn.setAttribute('data-history-back', '[]');
    }
    document.querySelector('#modal-transfer .close')?.classList.add('hidden');
    updateBackButtonVisibility();
  });
  showTransferSuccessAnimation(); 
});

/* --- Confetti Animation --- */
function showConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.inset = '0';
  confettiContainer.style.overflow = 'hidden';
  confettiContainer.style.pointerEvents = 'none';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '0';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => confettiContainer.remove(), 2500);
}

function showTopupSuccessAnimation() {
  document.getElementById('success-topup-animation')?.classList.remove('hidden');
  showConfetti();
}
function showTransferSuccessAnimation() {
  document.getElementById('success-transfer-animation')?.classList.remove('hidden');
  showConfetti();
}
function showSuccessModal() {
  document.getElementById('successModal')?.classList.remove('hidden');
  showConfetti();
}
document.getElementById('closeSuccessModal')?.addEventListener('click', () => {
  document.getElementById('successModal')?.classList.add('hidden');
});
