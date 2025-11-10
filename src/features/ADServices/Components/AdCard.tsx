import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { adService } from '@/services/api/adService';
import type { AdCard as AdCardType } from '@/types/ads';

interface AdCardProps {
  onClose?: () => void;
  delaySeconds?: number; // Delay before showing (from admin settings)
}

export const AdCard: React.FC<AdCardProps> = ({ onClose, delaySeconds = 3 }) => {
  const [adCard, setAdCard] = useState<AdCardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    loadAdCard();
  }, []);

  useEffect(() => {
    if (adCard && !dismissed) {
      // Show card after delay
      const timer = setTimeout(() => {
        setShowCard(true);
        // Record impression when card is shown
        adService.recordAdCardImpression(adCard.campaignId).catch(console.error);
      }, delaySeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [adCard, dismissed, delaySeconds]);

  const loadAdCard = async () => {
    try {
      const response = await adService.getActiveAdCard();
      if (response.success && response.data) {
        setAdCard(response.data);
      }
    } catch (error) {
      console.error('Error loading ad card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (adCard) {
      await adService.recordAdCardClick(adCard.campaignId).catch(console.error);
      if (adCard.linkUrl) {
        window.open(adCard.linkUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleClose = () => {
    setDismissed(true);
    setShowCard(false);
    if (onClose) {
      onClose();
    }
  };

  if (loading || dismissed || !adCard || !showCard) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-md animate-in fade-in zoom-in">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {adCard.imageUrl && (
          <img
            src={adCard.imageUrl}
            alt={adCard.headline}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        
        {adCard.videoUrl && (
          <video
            src={adCard.videoUrl}
            className="w-full h-48 object-cover rounded-t-lg"
            autoPlay
            muted
            loop
          />
        )}
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2">{adCard.headline}</h3>
          {adCard.description && (
            <p className="text-sm text-muted-foreground mb-4">{adCard.description}</p>
          )}
          
          {adCard.linkUrl && (
            <Button
              onClick={handleClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {adCard.callToAction || 'Learn More'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


