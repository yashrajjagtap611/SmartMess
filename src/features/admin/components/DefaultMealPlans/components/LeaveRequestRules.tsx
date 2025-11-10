import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
} from "lucide-react";
import type { LeaveRequestRulesProps } from '../DefaultMealPlans.types';

export const LeaveRequestRules: React.FC<LeaveRequestRulesProps> = ({
  leaveRules,
  errors,
  onLeaveRuleChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Leave Limits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Leave Application Limits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set maximum leave meals per month
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            leaveRules.leaveLimitsEnabled
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}>
            {leaveRules.leaveLimitsEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Switch
              id="leaveLimitsEnabled"
              checked={leaveRules.leaveLimitsEnabled}
              onCheckedChange={(checked: boolean) =>
                onLeaveRuleChange("leaveLimitsEnabled", checked)
              }
            />
            <div>
              <Label
                htmlFor="leaveLimitsEnabled"
                className="text-gray-900 dark:text-white font-semibold"
              >
                Enable leave application limits
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restrict maximum leave days and meals per month
              </p>
            </div>
          </div>
        </div>

        {leaveRules.leaveLimitsEnabled && (
          <>
            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
                {leaveRules.maxLeaveMealsEnabled ? (
                  <>
                    Users are allowed to apply for a maximum of{" "}
                    <span className="font-bold">
                      {leaveRules.maxLeaveMeals} meals
                    </span>{" "}
                    per month.
                  </>
                ) : (
                  "No leave limits are currently set."
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maxLeaveMealsEnabled"
                    checked={leaveRules.maxLeaveMealsEnabled}
                    onCheckedChange={(checked: boolean) =>
                      onLeaveRuleChange("maxLeaveMealsEnabled", checked)
                    }
                  />
                  <Label htmlFor="maxLeaveMealsEnabled" className="font-semibold">
                    Maximum Leave Meals
                  </Label>
                </div>
                {leaveRules.maxLeaveMealsEnabled && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={leaveRules.maxLeaveMeals}
                      onChange={(e) =>
                        onLeaveRuleChange("maxLeaveMeals", parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max="93"
                      className={errors['maxLeaveMeals'] ? 'border-red-500' : ''}
                    />
                    {errors['maxLeaveMeals'] && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors['maxLeaveMeals']}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Consecutive Leave Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Consecutive Leave Rules
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure rules for consecutive leave days
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            leaveRules.consecutiveLeaveEnabled
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}>
            {leaveRules.consecutiveLeaveEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <Switch
              id="consecutiveLeaveEnabled"
              checked={leaveRules.consecutiveLeaveEnabled}
              onCheckedChange={(checked: boolean) =>
                onLeaveRuleChange("consecutiveLeaveEnabled", checked)
              }
            />
            <div>
              <Label
                htmlFor="consecutiveLeaveEnabled"
                className="text-gray-900 dark:text-white font-semibold"
              >
                Enable consecutive leave rules
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set minimum consecutive days for leave requests
              </p>
            </div>
          </div>
        </div>

        {leaveRules.consecutiveLeaveEnabled && (
          <>
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
                Users must apply for a minimum of{" "}
                <span className="font-bold">
                  {leaveRules.minConsecutiveDays} consecutive days
                </span>{" "}
                when requesting leave.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="minConsecutiveDays" className="font-semibold">
                Minimum Consecutive Days
              </Label>
              <Input
                id="minConsecutiveDays"
                type="number"
                value={leaveRules.minConsecutiveDays}
                onChange={(e) =>
                  onLeaveRuleChange("minConsecutiveDays", parseInt(e.target.value) || 1)
                }
                min="1"
                max="31"
                className={errors['minConsecutiveDays'] ? 'border-red-500' : ''}
              />
              {errors['minConsecutiveDays'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['minConsecutiveDays']}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Notice Requirements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Notice Requirements
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set advance notice requirements for leave requests
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            leaveRules.requireTwoHourNotice
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}>
            {leaveRules.requireTwoHourNotice ? "Required" : "Not Required"}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3">
            <Switch
              id="requireTwoHourNotice"
              checked={leaveRules.requireTwoHourNotice}
              onCheckedChange={(checked: boolean) =>
                onLeaveRuleChange("requireTwoHourNotice", checked)
              }
            />
            <div>
              <Label
                htmlFor="requireTwoHourNotice"
                className="text-gray-900 dark:text-white font-semibold"
              >
                Require advance notice
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Users must provide advance notice before requesting leave
              </p>
            </div>
          </div>
        </div>

        {leaveRules.requireTwoHourNotice && (
          <>
            <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-200 font-medium">
                Users must provide{" "}
                <span className="font-bold">
                  {leaveRules.noticeHours} hours
                </span>{" "}
                advance notice before requesting leave.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="noticeHours" className="font-semibold">
                Notice Hours
              </Label>
              <Input
                id="noticeHours"
                type="number"
                value={leaveRules.noticeHours}
                onChange={(e) =>
                  onLeaveRuleChange("noticeHours", parseInt(e.target.value) || 1)
                }
                min="1"
                max="24"
                className={errors['noticeHours'] ? 'border-red-500' : ''}
              />
              {errors['noticeHours'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors['noticeHours']}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Approval Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Approval Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure automatic approval and subscription extension
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <Switch
                id="autoApproval"
                checked={leaveRules.autoApproval}
                onCheckedChange={(checked: boolean) =>
                  onLeaveRuleChange("autoApproval", checked)
                }
              />
              <div>
                <Label
                  htmlFor="autoApproval"
                  className="text-gray-900 dark:text-white font-semibold"
                >
                  Auto-approve leave requests
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically approve leave requests without manual review
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <Switch
                id="extendSubscription"
                checked={leaveRules.extendSubscription}
                onCheckedChange={(checked: boolean) =>
                  onLeaveRuleChange("extendSubscription", checked)
                }
              />
              <div>
                <Label
                  htmlFor="extendSubscription"
                  className="text-gray-900 dark:text-white font-semibold"
                >
                  Extend subscription for leave days
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically extend subscription to compensate for leave days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
