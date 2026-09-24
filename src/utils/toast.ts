type ToastType = 'success' | 'error' | 'info' | 'warning';

class Toast {
  private showNotification(message: string, type: ToastType) {
    // You can replace this with your preferred toast library
    // For now, we'll use a simple alert
    alert(`${type.toUpperCase()}: ${message}`);
  }

  success(message: string) {
    this.showNotification(message, 'success');
  }

  error(message: string) {
    this.showNotification(message, 'error');
  }

  info(message: string) {
    this.showNotification(message, 'info');
  }

  warning(message: string) {
    this.showNotification(message, 'warning');
  }
}

export const toast = new Toast(); 