import type { PaymentMethodDto } from '@/services/api-types';

export function formatHistoryDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCardLabel(method: PaymentMethodDto) {
  return `${method.brand} •••• ${method.last4}`;
}

export function getDigitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(cardNumber: string) {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'MasterCard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
  return 'Card';
}

export function formatCardNumberInput(value: string) {
  const digits = getDigitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function getRewardImageSource(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('iced latte') || normalized.includes('latte')) {
    return require('@/assets/images/featured-caramel-latte.jpg');
  }
  if (normalized.includes('mannino honey crepe') || normalized.includes('mannino')) {
    return require('@/assets/images/mannino honey crape.png');
  }
  if (normalized.includes('turkey club') || normalized.includes('turkey')) {
    return require('@/assets/images/turkeyclub.png');
  }
  if (normalized.includes('classic') || normalized.includes('bagel')) {
    return require('@/assets/images/classic.png');
  }
  if (normalized.includes('supernova')) {
    return require('@/assets/images/supernova.png');
  }
  if (normalized.includes('roaring') || normalized.includes('frappe')) {
    return require('@/assets/images/roaringfrape.png');
  }
  if (normalized.includes('strawberry') || normalized.includes('lemonade') || normalized.includes('lemond') || normalized.includes('limeade')) {
    return require('@/assets/images/strawberry.png');
  }
  if (normalized.includes('shaken')) {
    return require('@/assets/images/shaken.png');
  }
  if (normalized.includes('black') || normalized.includes('cold brew')) {
    return require('@/assets/images/blackwhitecoldbrew.png');
  }
  if (normalized.includes('turkey')) {
    return require('@/assets/images/turkeyclub.png');
  }

  return require('@/assets/images/ConceptLogo2-FpjOWRtT.png');
}

export function getRewardItemName(name: string, description?: string) {
  const combined = `${name} ${description ?? ''}`.toLowerCase();

  if (combined.includes('supernova')) return 'Supernova';
  if (combined.includes('strawberry') && (combined.includes('lemonade') || combined.includes('lemond') || combined.includes('limeade'))) return 'Strawberry Lemonade';
  if (combined.includes('strawberry')) return 'Strawberry Lemonade';
  if (combined.includes('the classic')) return 'The Classic';
  if (combined.includes('bagel')) return 'The Classic';
  if (combined.includes('10%')) return 'Any menu item';
  return name;
}