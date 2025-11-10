import React, { useMemo } from "react";
import {
  AcademicCapIcon,
  CalendarIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProfileFormData, UserProfile } from "../Profile.types";

type EducationCategory = "school" | "college" | "competitive" | "other";

const EDUCATION_CATEGORY_LABELS: Record<EducationCategory, string> = {
  school: "11th / 12th (School / Junior College)",
  college: "College / University",
  competitive: "Competitive Exam Preparation",
  other: "Other",
};

const COURSE_OPTIONS: string[] = [
  "Bachelor of Technology (B.Tech)",
  "Bachelor of Engineering (B.E)",
  "Bachelor of Science (B.Sc)",
  "Bachelor of Commerce (B.Com)",
  "Bachelor of Arts (B.A)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Computer Applications (BCA)",
  "Master of Technology (M.Tech)",
  "Master of Engineering (M.E)",
  "Master of Science (M.Sc)",
  "Master of Commerce (M.Com)",
  "Master of Arts (M.A)",
  "Master of Business Administration (MBA)",
  "Master of Computer Applications (MCA)",
  "Diploma in Engineering",
  "Diploma in Pharmacy",
  "Doctor of Philosophy (Ph.D)",
  "Doctor of Medicine (MD)",
  "Chartered Accountancy (CA)",
  "Company Secretary (CS)",
  "Architecture (B.Arch)",
  "Bachelor of Design (B.Des)",
  "Hotel Management (BHM)",
  "Law (LLB)",
];

const BRANCH_OPTIONS: string[] = [
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "Biomedical Engineering",
  "Artificial Intelligence & Data Science",
  "Cyber Security",
  "Robotics & Automation",
  "Mechatronics",
  "Automobile Engineering",
  "Metallurgical Engineering",
  "Petroleum Engineering",
  "Production Engineering",
  "Industrial Engineering",
  "Structural Engineering",
  "Environmental Science",
  "Agricultural Engineering",
  "Architecture & Planning",
  "Business Analytics",
  "Finance",
  "Marketing",
  "Human Resources",
  "Operations Management",
  "Psychology",
  "Economics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Statistics",
  "English Literature",
  "Mass Communication",
  "Fine Arts",
  "Fashion Design",
  "Interior Design",
  "Hotel & Hospitality Management",
];

interface StudentInfoSectionProps {
  profile: UserProfile;
  editForm: ProfileFormData;
  isEditing: boolean;
  isActive: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

const getDisplayValue = (value?: string | null) =>
  value && value.trim().length > 0 ? value : "Not provided";

const buildField = (
  isEditing: boolean,
  icon: React.ReactNode,
  label: string,
  value: string,
  readOnlyValue: string,
  onChange: (next: string) => void,
  placeholder: string,
  type: "text" | "email" = "text"
) => (
  <div className="flex items-center space-x-3">
    {icon}
    <div className="flex-1">
      <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
        />
      ) : (
        <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          {readOnlyValue}
        </p>
      )}
    </div>
  </div>
);

export const StudentInfoSection: React.FC<StudentInfoSectionProps> = ({
  profile,
  editForm,
  isEditing,
  isActive,
  onEdit,
  onSave,
  onCancel,
  setEditForm,
}) => {
  const studentInfoData = useMemo(
    () => (isEditing ? editForm.studentInfo : profile.studentInfo) || {},
    [editForm.studentInfo, profile.studentInfo, isEditing]
  );

  const [courseSearchTerm, setCourseSearchTerm] = React.useState("");
  const [isCustomCourse, setIsCustomCourse] = React.useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = React.useState("");
  const [isCustomBranch, setIsCustomBranch] = React.useState(false);

  const educationCategory = useMemo<EducationCategory>(() => {
    const value = studentInfoData?.educationCategory;
    if (
      value === "school" ||
      value === "college" ||
      value === "competitive" ||
      value === "other"
    ) {
      return value;
    }
    return "college";
  }, [studentInfoData?.educationCategory]);

  const fallbackInstitution =
    studentInfoData?.college || profile?.college || "";
  const fallbackCourse =
    studentInfoData?.course || profile?.course || "";
  const fallbackBranch = studentInfoData?.branch || "";

  const normalizedCourseValue = (studentInfoData?.course || "").trim();
  const courseMatchesSuggestion = useMemo(
    () =>
      COURSE_OPTIONS.some(
        (option) => option.toLowerCase() === normalizedCourseValue.toLowerCase()
      ),
    [normalizedCourseValue]
  );

  const normalizedBranchValue = (studentInfoData?.branch || "").trim();
  const branchMatchesSuggestion = useMemo(
    () =>
      BRANCH_OPTIONS.some(
        (option) => option.toLowerCase() === normalizedBranchValue.toLowerCase()
      ),
    [normalizedBranchValue]
  );

  React.useEffect(() => {
    if (!isEditing) {
      setCourseSearchTerm("");
      setIsCustomCourse(false);
      setBranchSearchTerm("");
      setIsCustomBranch(false);
      return;
    }

    if (normalizedCourseValue && !courseMatchesSuggestion) {
      setIsCustomCourse(true);
    } else {
      setIsCustomCourse(false);
    }
  }, [isEditing, normalizedCourseValue, courseMatchesSuggestion]);

  React.useEffect(() => {
    if (!isEditing) {
      return;
    }

    if (normalizedBranchValue && !branchMatchesSuggestion) {
      setIsCustomBranch(true);
    } else {
      setIsCustomBranch(false);
    }
  }, [isEditing, normalizedBranchValue, branchMatchesSuggestion]);

  const filteredCourseOptions = React.useMemo(() => {
    const search = courseSearchTerm.trim().toLowerCase();
    if (!search) {
      return COURSE_OPTIONS;
    }
    return COURSE_OPTIONS.filter((option) =>
      option.toLowerCase().includes(search)
    );
  }, [courseSearchTerm]);

  const filteredBranchOptions = React.useMemo(() => {
    const search = branchSearchTerm.trim().toLowerCase();
    if (!search) {
      return BRANCH_OPTIONS;
    }
    return BRANCH_OPTIONS.filter((option) =>
      option.toLowerCase().includes(search)
    );
  }, [branchSearchTerm]);

  const updateStudentInfo = (
    updater: (
      draft: NonNullable<ProfileFormData["studentInfo"]>
    ) => NonNullable<ProfileFormData["studentInfo"]>
  ) => {
    setEditForm((prev) => {
      const base: NonNullable<ProfileFormData["studentInfo"]> = {
        college: "",
        course: "",
        year: "",
        branch: "",
        collegeEmailId: "",
        educationCategory: "college",
        schoolClass: "",
        schoolStream: "",
        competitiveExam: "",
        academyName: "",
        ...(prev.studentInfo || {}),
      };

      return {
        ...prev,
        studentInfo: updater(base),
      };
    });
  };

  const handleCourseValueChange = (value: string) => {
    updateStudentInfo((draft) => ({
      ...draft,
      course: value,
    }));
  };

  const handleCourseSelection = (value: string) => {
    handleCourseValueChange(value);
    setIsCustomCourse(false);
    setCourseSearchTerm("");
  };

  const handleBranchValueChange = (value: string) => {
    updateStudentInfo((draft) => ({
      ...draft,
      branch: value,
    }));
  };

  const handleBranchSelection = (value: string) => {
    handleBranchValueChange(value);
    setIsCustomBranch(false);
    setBranchSearchTerm("");
  };

  const renderCourseField = () => {
    const limitedCourseOptions = filteredCourseOptions.slice(0, 15);
    const currentCourseValue = studentInfoData?.course || "";

    return (
      <div className="flex items-start space-x-3">
        <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Course / Degree
          </label>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <input
                type="text"
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                placeholder="Search course or degree"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
              />
              <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {limitedCourseOptions.length > 0 ? (
                  limitedCourseOptions.map((option) => {
                    const isSelected = option.toLowerCase() === currentCourseValue.trim().toLowerCase();
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleCourseSelection(option)}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-SmartMess-primary/10 text-SmartMess-primary font-medium"
                            : "text-SmartMess-light-text dark:text-SmartMess-dark-text hover:bg-SmartMess-primary/5 dark:hover:bg-gray-800"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No courses found for “{courseSearchTerm}”.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCourseSearchTerm("");
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-SmartMess-primary"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCourse(true);
                    if (!currentCourseValue || courseMatchesSuggestion) {
                      handleCourseValueChange("");
                    }
                  }}
                  className="text-xs font-medium text-SmartMess-primary hover:underline"
                >
                  Enter custom course / degree
                </button>
              </div>
              {isCustomCourse && (
                <input
                  type="text"
                  value={currentCourseValue}
                  onChange={(e) => handleCourseValueChange(e.target.value)}
                  placeholder="Add your course or degree"
                  className="block w-full rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                />
              )}
            </div>
          ) : (
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {getDisplayValue(fallbackCourse)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderBranchField = () => {
    const limitedBranchOptions = filteredBranchOptions.slice(0, 15);
    const currentBranchValue = studentInfoData?.branch || "";

    return (
      <div className="flex items-start space-x-3">
        <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Branch / Department
          </label>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <input
                type="text"
                value={branchSearchTerm}
                onChange={(e) => setBranchSearchTerm(e.target.value)}
                placeholder="Search branch or department"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
              />
              <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {limitedBranchOptions.length > 0 ? (
                  limitedBranchOptions.map((option) => {
                    const isSelected = option.toLowerCase() === currentBranchValue.trim().toLowerCase();
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleBranchSelection(option)}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-SmartMess-primary/10 text-SmartMess-primary font-medium"
                            : "text-SmartMess-light-text dark:text-SmartMess-dark-text hover:bg-SmartMess-primary/5 dark:hover:bg-gray-800"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No branches found for “{branchSearchTerm}”.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setBranchSearchTerm("")}
                  className="text-xs font-medium text-gray-500 hover:text-SmartMess-primary"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomBranch(true);
                    if (!currentBranchValue || branchMatchesSuggestion) {
                      handleBranchValueChange("");
                    }
                  }}
                  className="text-xs font-medium text-SmartMess-primary hover:underline"
                >
                  Enter custom branch / department
                </button>
              </div>
              {isCustomBranch && (
                <input
                  type="text"
                  value={currentBranchValue}
                  onChange={(e) => handleBranchValueChange(e.target.value)}
                  placeholder="Add your branch or department"
                  className="block w-full rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
                />
              )}
            </div>
          ) : (
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {getDisplayValue(fallbackBranch)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderSchoolFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "School / Junior College Name",
          studentInfoData?.college || "",
          getDisplayValue(fallbackInstitution),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              college: value,
            })),
          "Enter school or junior college name"
        )}
        {buildField(
          isEditing,
          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          "Class / Standard",
          studentInfoData?.schoolClass || "",
          getDisplayValue(studentInfoData?.schoolClass),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              schoolClass: value,
            })),
          "e.g., 11th, 12th"
        )}
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Stream (Science / Commerce / Arts)",
          studentInfoData?.schoolStream || "",
          getDisplayValue(studentInfoData?.schoolStream),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              schoolStream: value,
            })),
          "Enter your stream"
        )}
      </div>
      <div className="space-y-4">
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Subjects / Focus (Optional)",
          studentInfoData?.course || "",
          getDisplayValue(fallbackCourse),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              course: value,
            })),
          "e.g., PCM, Commerce with Maths"
        )}
        {buildField(
          isEditing,
          <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          "Contact Email (Optional)",
          studentInfoData?.collegeEmailId || "",
          getDisplayValue(studentInfoData?.collegeEmailId),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              collegeEmailId: value,
            })),
          "Enter contact email (optional)",
          "email"
        )}
      </div>
    </div>
  );

  const renderCompetitiveFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Exam Preparing For",
          studentInfoData?.competitiveExam || "",
          getDisplayValue(studentInfoData?.competitiveExam),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              competitiveExam: value,
            })),
          "e.g., JEE, NEET, UPSC"
        )}
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Academy / Institute Name",
          studentInfoData?.academyName || studentInfoData?.college || "",
          getDisplayValue(studentInfoData?.academyName || studentInfoData?.college),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              academyName: value,
            })),
          "Enter coaching institute name"
        )}
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Focus Subjects (Optional)",
          studentInfoData?.branch || "",
          getDisplayValue(studentInfoData?.branch),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              branch: value,
            })),
          "e.g., Physics, Aptitude"
        )}
      </div>
      <div className="space-y-4">
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "Batch / Program (Optional)",
          studentInfoData?.course || "",
          getDisplayValue(studentInfoData?.course),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              course: value,
            })),
          "e.g., Evening Batch, Weekend Program"
        )}
        {buildField(
          isEditing,
          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          "Target Year (Optional)",
          studentInfoData?.year || "",
          getDisplayValue(studentInfoData?.year),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              year: value,
            })),
          "e.g., 2025"
        )}
        {buildField(
          isEditing,
          <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          "Contact Email (Optional)",
          studentInfoData?.collegeEmailId || "",
          getDisplayValue(studentInfoData?.collegeEmailId),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              collegeEmailId: value,
            })),
          "Enter contact email (optional)",
          "email"
        )}
      </div>
    </div>
  );

  const renderCollegeFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        {buildField(
          isEditing,
          <AcademicCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          "College / University",
          studentInfoData?.college || "",
          getDisplayValue(fallbackInstitution),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              college: value,
            })),
          "Enter college/university name"
        )}
        {renderCourseField()}
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Year
            </label>
            {isEditing ? (
              <select
                value={studentInfoData?.year || ""}
                onChange={(e) =>
                  updateStudentInfo((draft) => ({
                    ...draft,
                    year: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Completed">Completed</option>
              </select>
            ) : (
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                {getDisplayValue(studentInfoData?.year)}
              </p>
            )}
          </div>
        </div>
        {renderBranchField()}
        {buildField(
          isEditing,
          <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          "College Email ID (Optional)",
          studentInfoData?.collegeEmailId || "",
          getDisplayValue(studentInfoData?.collegeEmailId),
          (value) =>
            updateStudentInfo((draft) => ({
              ...draft,
              collegeEmailId: value,
            })),
          "Enter college email address",
          "email"
        )}
      </div>
    </div>
  );

  const renderCategoryFields = () => {
    if (educationCategory === "school") return renderSchoolFields();
    if (educationCategory === "competitive") return renderCompetitiveFields();
    return renderCollegeFields();
  };

  return (
    <div
      className={`${
        isActive ? "block" : "hidden md:block"
      } bg-white dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-lg p-4 sm:p-6`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text flex items-center space-x-2">
          <AcademicCapIcon className="h-6 w-6" />
          <span>Student Information</span>
        </h3>
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <CheckIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-SmartMess-primary text-black rounded-lg hover:bg-SmartMess-primary-dark transition-colors text-sm w-full sm:w-auto"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="h-5 w-5 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              Education Category
            </label>
            {isEditing ? (
              <select
                value={editForm.studentInfo?.educationCategory || "college"}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    studentInfo: {
                      ...prev.studentInfo,
                      educationCategory: e.target.value as EducationCategory,
                    },
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-SmartMess-primary focus:ring-SmartMess-primary"
              >
                <option value="college">College / University</option>
                <option value="school">11th / 12th (School / Junior College)</option>
                <option value="competitive">Competitive Exam Preparation</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                {EDUCATION_CATEGORY_LABELS[educationCategory]}
              </p>
            )}
          </div>
        </div>

        {renderCategoryFields()}
      </div>
    </div>
  );
};

