export type AuthStackParamList = {
  AuthWelcome: undefined;
  UserLogin: undefined;
  UserSignUp: undefined;
  EmployerLogin: undefined;
  EmployerSignUp: undefined;
  ForgotPassword: { email?: string };
  EmailVerification: { email: string };
  AdminAuth: undefined;
  AdminTabs: undefined;
  AdminReview: undefined;
  AdminEmployerReview: undefined;
  AdminWorkerVerification: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen?: string } | undefined;
  WorkerOnboarding: undefined;
  SubmitJob: { employerId: string };
  EmployerApplications: { jobId: string; jobTitle: string };
  AdminAuth: undefined;
  AdminTabs: undefined;
};

export type MainTabParamList = {
  Подработки: undefined;
  Сохранённые: undefined;
  Профиль: undefined;
};

export type AdminTabParamList = {
  Вакансии: undefined;
  Работодатели: undefined;
  Работники: undefined;
};
