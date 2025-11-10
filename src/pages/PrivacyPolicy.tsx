import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = "November 3, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            SmartMess Platform - Your Privacy Matters
          </p>
          <Badge variant="secondary" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Last Updated: {lastUpdated}
          </Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-700 dark:text-blue-300">
              Protecting Your Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to SmartMess, a comprehensive mess management platform that connects mess owners, 
                users, and administrators. This Privacy Policy explains how we collect, use, protect, and 
                share your personal information when you use our platform, mobile application, and related services.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                By using SmartMess, you consent to the practices described in this Privacy Policy. 
                If you do not agree with this policy, please do not use our services.
              </p>
            </section>

            <Separator />

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    2.1 Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Profile pictures and personal preferences</li>
                    <li>Payment information and billing details</li>
                    <li>Mess membership details and subscription information</li>
                    <li>Identity verification documents (when required)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    2.2 Usage Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>App usage patterns and feature interactions</li>
                    <li>Meal preferences and dietary requirements</li>
                    <li>Leave applications and attendance records</li>
                    <li>Chat messages and community interactions</li>
                    <li>Feedback, complaints, and support requests</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    2.3 Technical Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>Device information (type, operating system, browser)</li>
                    <li>IP address and location data (with consent)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Log files and error reports</li>
                    <li>QR code scan data for meal verification</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Service Provision
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Manage your mess membership and subscriptions</li>
                    <li>Process payments and billing</li>
                    <li>Provide meal planning and tracking</li>
                    <li>Handle leave requests and attendance</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Communication
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Send notifications and updates</li>
                    <li>Respond to support requests</li>
                    <li>Facilitate community chat features</li>
                    <li>Share important announcements</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Platform Improvement
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Analyze usage patterns and preferences</li>
                    <li>Improve app performance and features</li>
                    <li>Develop new services and functionalities</li>
                    <li>Conduct research and analytics</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Security & Compliance
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Prevent fraud and unauthorized access</li>
                    <li>Comply with legal obligations</li>
                    <li>Enforce terms of service</li>
                    <li>Protect user safety and security</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Information Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Information Sharing and Disclosure
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                    We Never Sell Your Personal Data
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    SmartMess does not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Limited Sharing Scenarios
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                    <li><strong>Mess Owners:</strong> Basic profile information for membership management</li>
                    <li><strong>Payment Processors:</strong> Necessary billing information for transactions</li>
                    <li><strong>Service Providers:</strong> Technical partners who help operate our platform</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security and Protection
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Technical Safeguards
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure HTTPS connections</li>
                    <li>Regular security audits and updates</li>
                    <li>Multi-factor authentication options</li>
                    <li>Secure cloud infrastructure</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Operational Safeguards
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                    <li>Limited access on need-to-know basis</li>
                    <li>Employee training on data protection</li>
                    <li>Regular backup and disaster recovery</li>
                    <li>Incident response procedures</li>
                    <li>Data retention policies</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Your Privacy Rights
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Access Your Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Request a copy of your personal information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Correct Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Update or correct inaccurate data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Delete Your Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Request deletion of your personal information</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Limit Processing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Restrict how we use your information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Data Portability</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Export your data in a portable format</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Withdraw Consent</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Opt out of data processing activities</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Essential Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Required for basic platform functionality</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Help us understand usage patterns</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Preference Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Remember your settings and preferences</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Retention
              </h2>
              
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  We retain your personal information only as long as necessary to provide our services and comply with legal obligations:
                </p>
                
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                  <li><strong>Inactive Accounts:</strong> Data deleted after 2 years of inactivity</li>
                  <li><strong>Financial Records:</strong> Retained for 7 years for tax and legal compliance</li>
                  <li><strong>Chat Messages:</strong> Deleted after 1 year unless flagged for violations</li>
                  <li><strong>Support Tickets:</strong> Retained for 3 years for quality assurance</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  SmartMess is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you believe we have collected information 
                  from a child under 13, please contact us immediately.
                </p>
              </div>
            </section>

            <Separator />

            {/* International Transfers */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                10. International Data Transfers
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data during international transfers, 
                including standard contractual clauses and adequacy decisions.
              </p>
            </section>

            <Separator />

            {/* Changes to Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
                We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <Separator />

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contact Us
              </h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Email</p>
                      <p className="text-blue-700 dark:text-blue-300">privacy@smartmess.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Phone</p>
                      <p className="text-blue-700 dark:text-blue-300">+91 (XXX) XXX-XXXX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Address</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        SmartMess Technologies Pvt. Ltd.<br />
                        [Your Business Address]<br />
                        [City, State, PIN Code]<br />
                        India
                      </p>
                    </div>
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
                This Privacy Policy is effective as of {lastUpdated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
