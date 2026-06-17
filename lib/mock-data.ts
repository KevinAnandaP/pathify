import { Facts, runForwardChaining, Diagnosis } from "./expert-system";

export interface StudentRecord {
  id: string;
  name: string;
  facts: Facts;
  diagnosis: Diagnosis;
  tasksCompleted: number;
}

export const MOCK_STUDENTS_RAW = [
  {
    id: "std-1",
    name: "Daniel Ferdian",
    facts: {
      strugglesLogic: true,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: false,
      learningStyle: "Kinesthetic" as const
    },
    tasksCompleted: 2
  },
  {
    id: "std-2",
    name: "Kevin Ananda Putra",
    facts: {
      strugglesLogic: false,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: true,
      strugglesDataStructures: false,
      learningStyle: "Visual" as const
    },
    tasksCompleted: 0
  },
  {
    id: "std-3",
    name: "Rafif Adyatma",
    facts: {
      strugglesLogic: true,
      strugglesCoreOOP: true,
      strugglesAdvancedOOP: true,
      strugglesDataStructures: true,
      learningStyle: "Kinesthetic" as const
    },
    tasksCompleted: 1
  },
  {
    id: "std-4",
    name: "Siti Rahma",
    facts: {
      strugglesLogic: true,
      strugglesCoreOOP: true,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: true,
      learningStyle: "Auditory" as const
    },
    tasksCompleted: 2
  },
  {
    id: "std-5",
    name: "Budi Santoso",
    facts: {
      strugglesLogic: false,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: false,
      learningStyle: "Visual" as const
    },
    tasksCompleted: 3
  },
  {
    id: "std-6",
    name: "Ahmad Hidayat",
    facts: {
      strugglesLogic: false,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: true,
      strugglesDataStructures: false,
      learningStyle: "Kinesthetic" as const
    },
    tasksCompleted: 1
  },
  {
    id: "std-7",
    name: "Laila Fitri",
    facts: {
      strugglesLogic: true,
      strugglesCoreOOP: false,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: false,
      learningStyle: "Visual" as const
    },
    tasksCompleted: 1
  },
  {
    id: "std-8",
    name: "Andi Wijaya",
    facts: {
      strugglesLogic: false,
      strugglesCoreOOP: true,
      strugglesAdvancedOOP: false,
      strugglesDataStructures: false,
      learningStyle: "Auditory" as const
    },
    tasksCompleted: 0
  }
];

export const MOCK_STUDENTS: StudentRecord[] = MOCK_STUDENTS_RAW.map(student => {
  const result = runForwardChaining(student.facts);
  // Mark some tasks completed based on the tasksCompleted indicator
  const tasks = result.diagnosis.remediationTasks.map((t, idx) => ({
    ...t,
    completed: idx < student.tasksCompleted
  }));
  return {
    ...student,
    diagnosis: {
      ...result.diagnosis,
      remediationTasks: tasks
    }
  };
});

export const SAMPLE_CSV_STRING = `Nama,StrugglesLogic,StrugglesCoreOOP,StrugglesAdvancedOOP,StrugglesDataStructures,LearningStyle
Daniel Ferdian,true,false,false,false,Kinesthetic
Kevin Ananda Putra,false,false,true,false,Visual
Rafif Adyatma,true,true,true,true,Kinesthetic
Siti Rahma,true,true,false,true,Auditory
Budi Santoso,false,false,false,false,Visual
Ahmad Hidayat,false,false,true,false,Kinesthetic
Laila Fitri,true,false,false,false,Visual
Andi Wijaya,false,true,false,false,Auditory
Citra Kirana,true,true,true,false,Visual
Farhan Alamsyah,false,true,true,true,Kinesthetic`;
