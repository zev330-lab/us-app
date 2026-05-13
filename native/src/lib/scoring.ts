export type Bucket = 'deep' | 'warm' | 'balanced' | 'gentle' | 'space';

export const BUCKETS: readonly Bucket[] = ['deep', 'warm', 'balanced', 'gentle', 'space'] as const;

export function getCoupleNet(myFeeling: number, partnerFeeling: number): number {
  return (2 * myFeeling - 100) + (2 * partnerFeeling - 100);
}

export function getBucket(coupleNet: number): Bucket {
  if (coupleNet >= 60) return 'deep';
  if (coupleNet >= 20) return 'warm';
  if (coupleNet >= -19) return 'balanced';
  if (coupleNet >= -59) return 'gentle';
  return 'space';
}

export interface BucketLabel {
  label: string;
  emoji: string;
  color: string;
}

export const BUCKET_LABELS: Record<Bucket, BucketLabel> = {
  deep:     { label: 'Deep Connection', emoji: '💕', color: '#E8727A' },
  warm:     { label: 'Feeling Good',    emoji: '✨', color: '#E8727A' },
  balanced: { label: 'Balanced',        emoji: '🌊', color: '#C9A96E' },
  gentle:   { label: 'Thinking Mode',   emoji: '🤔', color: '#4A90D9' },
  space:    { label: 'Heavy Thinking',  emoji: '💭', color: '#4A90D9' },
};
