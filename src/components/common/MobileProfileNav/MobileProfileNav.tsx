import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  ClockIcon, 
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export interface ProfileSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface MobileProfileNavProps {
  sections: ProfileSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export const MobileProfileNav: React.FC<MobileProfileNavProps> = ({
  sections,
  activeSection,
  onSectionChange,
  className = ''
}) => {
  return (
    <div className={`md:hidden ${className} relative`}>
      <div className="w-full overflow-x-auto scrollbar-hide-horizontal scroll-smooth-horizontal relative">
        <div className="flex space-x-3 p-4 pb-3 min-w-max pr-4">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onSectionChange(section.id)}
                className={`flex-shrink-0 whitespace-nowrap px-5 py-2 h-11 transition-all duration-200 min-w-[120px] ${
                  isActive 
                    ? 'SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground shadow-md scale-105' 
                    : 'SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-hover dark:SmartMess-dark-hover hover:scale-102'
                }`}
              >
                <span className={`mr-2 flex-shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-primary-foreground' : 'SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary'
                }`}>
                  {section.icon}
                </span>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary-foreground' : 'SmartMess-light-text dark:SmartMess-dark-text'
                }`}>
                  {section.title}
                </span>
              </Button>
            );
          })}
        </div>
        {/* Scroll indicator - subtle fade on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-SmartMess-light-surface dark:SmartMess-dark-surface to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

// Predefined section configurations for different user roles
export const USER_PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'information',
    title: 'Information',
    icon: <UserIcon className="h-4 w-4" />,
    description: 'Personal information and details'
  },
  {
    id: 'activities',
    title: 'Activities',
    icon: <ClockIcon className="h-4 w-4" />,
    description: 'Recent activities and history'
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: <CreditCardIcon className="h-4 w-4" />,
    description: 'Meal plan subscriptions'
  }
];

export const MESS_OWNER_PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'information',
    title: 'Information',
    icon: <UserIcon className="h-4 w-4" />,
    description: 'Personal and business information'
  }
];

export const ADMIN_PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'information',
    title: 'Information',
    icon: <UserIcon className="h-4 w-4" />,
    description: 'Personal and administrative information'
  },
  {
    id: 'permissions',
    title: 'Permissions',
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    description: 'System permissions and access levels'
  }
];
