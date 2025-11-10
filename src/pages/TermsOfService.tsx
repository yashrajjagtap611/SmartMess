import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, AlertTriangle, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const lastUpdated = "November 3, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            SmartMess Platform - Terms and Conditions
          </p>
          <Badge variant="secondary" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Last Updated: {lastUpdated}
          </Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-700 dark:text-green-300">
              Agreement to Use SmartMess Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to SmartMess! By accessing or using our platform, mobile application, or any related services, 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                please do not use our services.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    These Terms constitute a legally binding agreement between you and SmartMess Technologies Pvt. Ltd.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                SmartMess is a comprehensive mess management platform that provides:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Mess membership management</li>
                  <li>Meal planning and tracking</li>
                  <li>Payment processing and billing</li>
                  <li>Leave application system</li>
                  <li>Community chat features</li>
                </ul>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>QR-based meal verification</li>
                  <li>Feedback and complaint management</li>
                  <li>Analytics and reporting</li>
                  <li>Administrative tools</li>
                  <li>Mobile and web applications</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Accounts and Registration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    3.1 Account Creation
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>You must provide accurate and complete information during registration</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must be at least 13 years old to create an account</li>
                    <li>One person may not maintain multiple accounts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    3.2 Account Security
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>You are responsible for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Use strong passwords and enable two-factor authentication when available</li>
                    <li>Do not share your account credentials with others</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* User Conduct */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Acceptable Use and Conduct
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                    ✓ Permitted Uses
                  </h3>
                  <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm ml-4">
                    <li>Use services for legitimate mess management purposes</li>
                    <li>Provide accurate information and maintain updated profiles</li>
                    <li>Respect other users and maintain professional communication</li>
                    <li>Follow mess rules and policies set by mess owners</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                    ✗ Prohibited Activities
                  </h3>
                  <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1 text-sm ml-4">
                    <li>Harassment, abuse, or discrimination against other users</li>
                    <li>Sharing false, misleading, or fraudulent information</li>
                    <li>Attempting to hack, disrupt, or compromise platform security</li>
                    <li>Using the platform for illegal activities or spam</li>
                    <li>Violating intellectual property rights</li>
                    <li>Creating fake accounts or impersonating others</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Payment Terms and Billing
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    5.1 Subscription Plans
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Various subscription plans available for mess owners</li>
                    <li>Pricing and features clearly displayed before purchase</li>
                    <li>Automatic renewal unless cancelled before billing cycle</li>
                    <li>Pro-rated charges for plan upgrades</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    5.2 Payment Processing
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Secure payment processing through trusted third-party providers</li>
                    <li>All payments in Indian Rupees (INR) unless otherwise specified</li>
                    <li>Failed payments may result in service suspension</li>
                    <li>Refunds processed according to our refund policy</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    5.3 Refund Policy
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>30-day money-back guarantee for new subscriptions</li>
                    <li>Pro-rated refunds for annual plans cancelled within 60 days</li>
                    <li>No refunds for monthly plans after 30 days</li>
                    <li>Refund requests must be submitted through official channels</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Intellectual Property Rights
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    6.1 SmartMess Property
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All content, features, and functionality of the SmartMess platform, including but not limited to 
                    text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, 
                    and software, are owned by SmartMess Technologies Pvt. Ltd.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    6.2 User Content
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>You retain ownership of content you create and upload</li>
                    <li>You grant us license to use your content for service provision</li>
                    <li>You are responsible for ensuring you have rights to uploaded content</li>
                    <li>We may remove content that violates these Terms</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Privacy and Data */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Privacy and Data Protection
              </h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Your privacy is important to us. Our collection, use, and protection of your personal information 
                      is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                      By using our services, you consent to the collection and use of information as described in our Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Service Availability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Service Availability and Modifications
              </h2>
              
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Modify, suspend, or discontinue services with reasonable notice</li>
                  <li>Perform scheduled maintenance and updates</li>
                  <li>Implement new features and improvements</li>
                  <li>Change pricing with 30 days advance notice</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Disclaimers */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Disclaimers and Limitation of Liability
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Service Disclaimer
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    SmartMess is provided "as is" and "as available" without warranties of any kind, 
                    either express or implied, including but not limited to warranties of merchantability, 
                    fitness for a particular purpose, or non-infringement.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Limitation of Liability
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    To the maximum extent permitted by law, SmartMess Technologies Pvt. Ltd. shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages arising from your use 
                    of our services.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Account Termination
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    By You
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Cancel subscription anytime from account settings</li>
                    <li>Request account deletion through support</li>
                    <li>Export your data before termination</li>
                    <li>Settle outstanding payments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    By SmartMess
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Violation of Terms of Service</li>
                    <li>Fraudulent or illegal activities</li>
                    <li>Non-payment of fees</li>
                    <li>Abuse of platform or other users</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Governing Law and Dispute Resolution
              </h2>
              
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  These Terms are governed by the laws of India. Any disputes arising from these Terms or your use 
                  of SmartMess services shall be resolved through:
                </p>
                <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Good faith negotiation between the parties</li>
                  <li>Mediation through a mutually agreed mediator</li>
                  <li>Binding arbitration in accordance with Indian Arbitration laws</li>
                  <li>Courts of competent jurisdiction in [Your City], India</li>
                </ol>
              </div>
            </section>

            <Separator />

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contact Information
              </h2>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <p className="text-green-800 dark:text-green-200 mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Email</p>
                    <p className="text-green-700 dark:text-green-300">legal@smartmess.com</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Phone</p>
                    <p className="text-green-700 dark:text-green-300">+91 (XXX) XXX-XXXX</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="font-medium text-green-800 dark:text-green-200">Address</p>
                    <p className="text-green-700 dark:text-green-300">
                      SmartMess Technologies Pvt. Ltd.<br />
                      [Your Business Address]<br />
                      [City, State, PIN Code], India
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 SmartMess Technologies Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                These Terms of Service are effective as of {lastUpdated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
