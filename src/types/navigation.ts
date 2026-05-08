export type AuthStackParamList = {
  AuthWelcome: undefined;
  UserLogin: undefined;
  UserSignUp: undefined;
  EmployerLogin: undefined;
  EmployerSignUp: undefined;
  ForgotPassword: { email?: string };
  EmailVerification: { email: string };
};

export type RootStackParamList = {
  MainTabs: { screen?: string } | undefined;
  WorkerOnboarding: undefined;
  AdminAuth: undefined;
  AdminReview: undefined;
  AdminEmployerReview: undefined;
  AdminWorkerVerification: undefined;
  SubmitJob: { employerId: string };
  EmployerApplications: { jobId: string; jobTitle: string };
};

export type MainTabParamList = {
  Подработки: undefined;
  Сохранённые: undefined;
  Профиль: undefined;
};
