/**
 * Data Journey - DOM Helpers, Modal Manager & Toast Notifications
 */

export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Toast Notification System
 */
let toastContainer = null;

export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: bold;">${icons[type] || '•'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/**
 * Modal Manager
 */
let activeModal = null;

export function openModal(modalIdOrOptions) {
  closeModal();

  if (typeof modalIdOrOptions === 'object' && modalIdOrOptions !== null) {
    let customModal = $('#genericInfoModal');
    if (!customModal) {
      customModal = document.createElement('div');
      customModal.id = 'genericInfoModal';
      customModal.className = 'modal-overlay';
      document.body.appendChild(customModal);
    }

    const title = modalIdOrOptions.title || 'Information';
    const bodyHtml = modalIdOrOptions.bodyHtml || modalIdOrOptions.message || '';
    const confirmText = modalIdOrOptions.confirmText || 'Got It';
    const confirmClass = modalIdOrOptions.confirmClass || 'btn-primary';

    customModal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="card-title">${title}</h3>
          <button class="btn btn-ghost btn-sm" id="genericInfoCloseBtn">✕</button>
        </div>
        <div class="modal-body" style="color: var(--text-secondary); line-height: 1.6;">
          ${bodyHtml}
        </div>
        <div class="modal-footer">
          <button class="btn ${confirmClass} btn-sm" id="genericInfoConfirmBtn">${confirmText}</button>
        </div>
      </div>
    `;

    customModal.querySelector('#genericInfoCloseBtn').addEventListener('click', closeModal);
    customModal.querySelector('#genericInfoConfirmBtn').addEventListener('click', () => {
      closeModal();
      if (typeof modalIdOrOptions.onConfirm === 'function') modalIdOrOptions.onConfirm();
    });

    activeModal = customModal;
    customModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }

  const modal = $(`#${modalIdOrOptions}`);
  if (!modal) return;

  activeModal = modal;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Find first autofocus or input field
  const firstInput = modal.querySelector('input, textarea, select');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 80);
  }
}

export function closeModal() {
  if (activeModal) {
    activeModal.classList.remove('active');
    activeModal = null;
    document.body.style.overflow = '';
  }
}

/**
 * Show a reusable confirmation dialog
 */
export function showConfirm(titleOrOptions, message, onConfirm, confirmText = 'Confirm', isDanger = false) {
  let title = titleOrOptions;
  let bodyMessage = message;
  let confirmCallback = onConfirm;
  let text = confirmText;
  let danger = isDanger;

  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    title = titleOrOptions.title || 'Confirm Action';
    bodyMessage = titleOrOptions.message || '';
    confirmCallback = titleOrOptions.onConfirm;
    text = titleOrOptions.confirmText || 'Confirm';
    danger = titleOrOptions.isDanger || (titleOrOptions.confirmClass && titleOrOptions.confirmClass.includes('danger')) || false;
  }

  let confirmModal = $('#confirmModal');
  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.id = 'confirmModal';
    confirmModal.className = 'modal-overlay';
    confirmModal.innerHTML = `
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="card-title" id="confirmModalTitle">Confirm Action</h3>
          <button class="btn btn-ghost btn-sm" id="confirmModalCloseBtn">✕</button>
        </div>
        <div class="modal-body" id="confirmModalBody" style="color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="confirmModalCancelBtn">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirmModalActionBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmModal);

    $('#confirmModalCloseBtn').addEventListener('click', closeModal);
    $('#confirmModalCancelBtn').addEventListener('click', closeModal);
  }

  $('#confirmModalTitle').textContent = title;
  $('#confirmModalBody').textContent = bodyMessage;

  const actionBtn = $('#confirmModalActionBtn');
  actionBtn.textContent = text;
  actionBtn.className = danger ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm';

  const newActionBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);

  newActionBtn.addEventListener('click', () => {
    closeModal();
    if (typeof confirmCallback === 'function') confirmCallback();
  });

  openModal('confirmModal');
}

// Global backdrop click and Escape listener
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeModal) {
    closeModal();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});
