export type Student = {
  id: number | string;
  name: string;
  image_url?: string;
};

export type AttendanceCheckInResult = {
  student?: Student;
  matched: boolean;
  confidence?: number;
  date: string;
};
