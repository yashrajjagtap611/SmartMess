import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface FooterProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ className = '', variant = 'default' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={`bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} SmartMess. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link 
                to={ROUTES.PUBLIC.PRIVACY_POLICY}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to={ROUTES.PUBLIC.TERMS_OF_SERVICE}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">SmartMess</h3>
            <p className="text-gray-300 text-sm mb-4">
              Revolutionizing mess management with smart technology. 
              Connecting mess owners, users, and administrators for seamless dining experiences.
            </p>
            <p className="text-gray-400 text-xs">
              © {currentYear} SmartMess Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to={ROUTES.PUBLIC.WELCOME}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to={ROUTES.PUBLIC.LOGIN}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to={ROUTES.PUBLIC.REGISTER}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-md font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to={ROUTES.PUBLIC.PRIVACY_POLICY}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to={ROUTES.PUBLIC.TERMS_OF_SERVICE}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:legal@smartmess.com"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Contact Legal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">
              Made with ❤️ for better mess management
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a 
                href="mailto:support@smartmess.com"
                className="text-gray-400 hover:text-white text-xs transition-colors"
              >
                Support
              </a>
              <a 
                href="mailto:privacy@smartmess.com"
                className="text-gray-400 hover:text-white text-xs transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
