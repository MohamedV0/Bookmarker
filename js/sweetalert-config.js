const THEME = {
  colors: {
    primary: '#352e28',
    success: '#4db748',
    error: '#eb1d36',
    warning: '#fec260',
    cancel: '#6c757d',
    background: '#F7ECDE'
  }
};

const baseConfig = {
  background: THEME.colors.background,
  color: THEME.colors.primary,
  customClass: {
    popup: 'custom-toast-popup',
    title: 'custom-toast-title'
  }
};

const toastBase = {
  ...baseConfig,
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
};

const SweetAlertConfig = {
  successToast: {
    ...toastBase,
    icon: 'success',
    iconColor: THEME.colors.success
  },

  errorToast: {
    ...toastBase,
    icon: 'error',
    iconColor: THEME.colors.error,
    timer: 3000
  },

  deleteConfirm: {
    ...baseConfig,
    title: 'Are you sure?',
    text: 'You are about to delete this bookmark',
    icon: 'warning',
    iconColor: THEME.colors.error,
    showCancelButton: true,
    confirmButtonColor: THEME.colors.error,
    cancelButtonColor: THEME.colors.cancel,
    confirmButtonText: 'Yes, delete it!',
    customClass: {
      ...baseConfig.customClass,
      popup: 'custom-confirm-popup'
    }
  },

  validationError: {
    ...baseConfig,
    title: 'Invalid Input',
    icon: 'error',
    iconColor: THEME.colors.error,
    html: `
      <div class="validation-content">
        <p class="validation-message">Please follow these rules:</p>
        <ul class="validation-rules">
          <li>
            <i class="fa-regular fa-circle-right"></i>
            Site name must contain at least 3 characters
          </li>
          <li>
            <i class="fa-regular fa-circle-right"></i>
            Site URL must be a valid one
          </li>
        </ul>
      </div>
    `,
    showCancelButton: false,
    confirmButtonColor: THEME.colors.error,
    confirmButtonText: 'Got it!',
    customClass: {
      ...baseConfig.customClass,
      popup: 'custom-confirm-popup',
      htmlContainer: 'custom-validation-container'
    }
  }
};

function showNotification(type, title, text) {
  const config = {
    ...(type === 'error' ? SweetAlertConfig.errorToast : SweetAlertConfig.successToast),
    title,
    text
  };
  
  Swal.fire(config);
}

window.SweetAlertConfig = SweetAlertConfig;
window.showNotification = showNotification;