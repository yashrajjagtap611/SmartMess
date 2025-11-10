import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { LeaveRequestRulesProps } from '../MealPlan.types';

export const LeaveRequestRules: React.FC<LeaveRequestRulesProps> = ({
  leaveRules,
  errors,
  onLeaveRuleChange,
}) => {
  // Memoize calculated values to prevent unnecessary re-renders
  const isLeaveLimitsEnabled = useMemo(() => {
    return leaveRules.leaveLimitsEnabled;
  }, [leaveRules.leaveLimitsEnabled]);

  const isMaxLeaveMealsEnabled = useMemo(() => {
    return leaveRules.maxLeaveMealsEnabled;
  }, [leaveRules.maxLeaveMealsEnabled]);

  return (
    <Card className="SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-border shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-SmartMess-light-accent dark:SmartMess-dark-accent to-SmartMess-light-primary dark:SmartMess-dark-primary/10 border-b SmartMess-light-border dark:SmartMess-dark-border px-8 py-6">
        <CardTitle className="flex items-center gap-3 SmartMess-light-text dark:SmartMess-dark-text text-xl font-bold">
          <div className="p-2 SmartMess-light-primary dark:SmartMess-dark-primary/20 rounded-xl">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          Leave Request Rules
        </CardTitle>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-2">
          Configure rules and policies for user leave requests
        </p>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {/* Leave Limits */}
        <div className="space-y-6 pt-2">
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
                  Set maximum leave meals per billing period
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isLeaveLimitsEnabled
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}>
              {isLeaveLimitsEnabled ? "Enabled" : "Disabled"}
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
                  Restrict maximum leave meals per billing period
                </p>
              </div>
            </div>
          </div>

          {isLeaveLimitsEnabled && (
            <>
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
                  {isMaxLeaveMealsEnabled ? (
                    <>
                      Users are allowed to apply for a maximum of{" "}
                      <span className="font-bold">
                        {leaveRules.maxLeaveMeals} meals
                      </span>{" "}
                      per billing period.
                    </>
                  ) : (
                    "No leave limits are currently enforced."
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                {/* Maximum Leave Meals Switch */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="maxLeaveMealsEnabled"
                      checked={leaveRules.maxLeaveMealsEnabled}
                      onCheckedChange={(checked: boolean) =>
                        onLeaveRuleChange("maxLeaveMealsEnabled", checked)
                      }
                    />
                    <div>
                      <Label
                        htmlFor="maxLeaveMealsEnabled"
                        className="text-gray-900 dark:text-white font-semibold"
                      >
                        Limit by maximum meals per billing period
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Restrict leave based on number of meals
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leaveRules.maxLeaveMealsEnabled
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}>
                    {leaveRules.maxLeaveMealsEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-6">
                  {leaveRules.maxLeaveMealsEnabled && (
                    <div className="space-y-3">
                      <Label 
                        htmlFor="maxLeaveMeals"
                        className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wide"
                      >
                        Maximum Leave Meals per Billing Period
                      </Label>
                      <Input
                        id="maxLeaveMeals"
                        type="number"
                        min="1"
                        max="93"
                        value={leaveRules.maxLeaveMeals}
                        onChange={(e) =>
                          onLeaveRuleChange(
                            "maxLeaveMeals",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                          errors['maxLeaveMeals']
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4`}
                      />
                      {errors['maxLeaveMeals'] && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-1 mt-2">
                          <AlertCircle className="h-4 w-4" />
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

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        {/* Leave Timing */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Leave Request Timing
            </h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-3">
                <Switch
                  id="requireTwoHourNotice"
                  checked={leaveRules.requireTwoHourNotice}
                  onCheckedChange={(checked: boolean) =>
                    onLeaveRuleChange(
                      "requireTwoHourNotice",
                      checked
                    )
                  }
                />
                <div>
                  <Label
                    htmlFor="requireTwoHourNotice"
                    className="text-gray-900 dark:text-white font-semibold"
                  >
                    Require advance notice for single meal requests
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enforce timing rules for leave submissions
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  leaveRules.requireTwoHourNotice
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                }`}
              >
                {leaveRules.requireTwoHourNotice
                  ? "Enabled"
                  : "Disabled"}
              </div>
            </div>

            {leaveRules.requireTwoHourNotice && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="noticeHours"
                    className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wide"
                  >
                    Notice Hours Required
                  </Label>
                  <Input
                    id="noticeHours"
                    type="number"
                    min="1"
                    max="24"
                    value={leaveRules.noticeHours}
                    onChange={(e) =>
                      onLeaveRuleChange(
                        "noticeHours",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                      errors['noticeHours']
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500/20"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4`}
                  />
                  {errors['noticeHours'] && (
                    <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors['noticeHours']}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Users must submit single meal leave requests at least {leaveRules.noticeHours} hour{leaveRules.noticeHours > 1 ? 's' : ''} before scheduled meal time.
                  </p>
                </div>
              </div>
            )}

            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
                <strong>Single Meal Leave:</strong> Must submit at
                least {leaveRules.noticeHours} hour{leaveRules.noticeHours > 1 ? 's' : ''} before scheduled meal time.
                <br />
                <strong>Multiple Meals Leave:</strong> No strict
                timing rule applies.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        {/* Continuous Leave */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Continuous Leave Requirements
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set minimum consecutive days for leave requests
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              leaveRules.consecutiveLeaveEnabled
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}>
              {leaveRules.consecutiveLeaveEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
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
                  Enable consecutive leave requirements
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Require minimum consecutive days for leave
                </p>
              </div>
            </div>
          </div>

          {leaveRules.consecutiveLeaveEnabled && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label
                  htmlFor="minConsecutiveDays"
                  className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wide"
                >
                  Minimum Consecutive Days
                </Label>
                <Input
                  id="minConsecutiveDays"
                  type="number"
                  min="1"
                  max="31"
                  value={leaveRules.minConsecutiveDays}
                  onChange={(e) =>
                    onLeaveRuleChange(
                      "minConsecutiveDays",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                    errors['minConsecutiveDays']
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4`}
                />
                {errors['minConsecutiveDays'] && (
                  <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors['minConsecutiveDays']}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Users must apply for at least{" "}
                  {leaveRules.minConsecutiveDays} consecutive
                  days of leave.
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        {/* Subscription Extension */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Subscription Extension
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
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
                  Extend subscription end date by leave days
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ensure users get full subscription value
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                leaveRules.extendSubscription
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {leaveRules.extendSubscription
                ? "Enabled"
                : "Disabled"}
            </div>
          </div>

          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
              When enabled, the subscription end date will be extended
              by the number of days the user is on leave, ensuring
              they receive the full value of their subscription.
            </AlertDescription>
          </Alert>
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        {/* Approval Criteria */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Approval Criteria
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800">
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
                  Enable automatic approval for valid requests
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-approve compliant requests
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                leaveRules.autoApproval
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {leaveRules.autoApproval
                ? "Enabled"
                : "Disabled"}
            </div>
          </div>

          <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
              Leave requests will be automatically approved if they
              comply with all rules. Invalid requests will be flagged
              for manual review and may be denied.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};









