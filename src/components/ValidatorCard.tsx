import React from 'react';
import { Star } from 'lucide-react';
import { Validator } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ValidatorCardProps {
  validator: Validator;
}

export const ValidatorCard = ({ validator }: ValidatorCardProps) => {
  const { name, avatar, expertise, reputation, jurisdiction, validationCount } = validator;

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-3">
        <img 
          src={avatar} 
          alt={name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" />
            <span className="text-sm text-neutral-700">{reputation.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex-1">
        <div className="mb-2">
          <span className="text-xs text-neutral-500">Expertise</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {expertise.map(exp => (
              <Badge key={exp} variant="primary" className="capitalize">
                {exp.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-2">
          <span className="text-xs text-neutral-500">Jurisdiction</span>
          <p className="text-sm">{jurisdiction}</p>
        </div>
        
        <div>
          <span className="text-xs text-neutral-500">Validations</span>
          <p className="text-sm">{validationCount}</p>
        </div>
      </div>
      
      <Button variant="secondary" size="sm" fullWidth>
        Request Validation
      </Button>
    </Card>
  );
};