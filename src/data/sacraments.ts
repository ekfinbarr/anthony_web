export type SacramentIconKey =
  | "font"
  | "dove"
  | "chalice"
  | "confessional"
  | "flask"
  | "heart"
  | "priest";

export type SacramentCategory = "Initiation" | "Healing" | "Service";

export interface Sacrament {
  id: string;
  name: string;
  description: string;
  category: SacramentCategory;
  iconKey: SacramentIconKey;
  schedule?: {
    date: string;
    time: string;
    location: string;
  };
  requirements: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  registrationRequired: boolean;
  registrationDeadline?: string;
}

export const mockSacraments: Sacrament[] = [
  {
    id: "baptism",
    name: "Baptism",
    description:
      "Baptism is the first sacrament of initiation, welcoming individuals into the Christian community. Through baptism, we are cleansed of original sin and become members of the Church.",
    category: "Initiation",
    iconKey: "font",
    schedule: {
      date: "First Saturday of each month",
      time: "10:00 AM",
      location: "Main Sanctuary",
    },
    requirements: [
      "Birth certificate",
      "Godparent certificates",
      "Baptism preparation class attendance",
      "Parent meeting with priest",
    ],
    contact: {
      name: "Very Rev. Fr. Sylvester Tolulope Oladunjoye",
      email: "baptism@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
    registrationDeadline: "2 weeks before scheduled date",
  },
  {
    id: "confirmation",
    name: "Confirmation",
    description:
      "Confirmation completes the grace of Baptism by a special outpouring of the gifts of the Holy Spirit, which seal or confirm the baptized in union with Christ.",
    category: "Initiation",
    iconKey: "dove",
    schedule: {
      date: "Annually during Easter season",
      time: "TBA",
      location: "Main Sanctuary",
    },
    requirements: [
      "Baptism certificate",
      "Confirmation sponsor",
      "Completion of religious education classes",
      "Age requirement: 16 years or older",
    ],
    contact: {
      name: "Very Rev. Fr. Sylvester Tolulope Oladunjoye",
      email: "confirmation@stanthonygbaja.org",
      phone: "(234) 234 567 8911",
    },
    registrationRequired: true,
    registrationDeadline: "3 months before scheduled date",
  },
  {
    id: "eucharist",
    name: "Holy Eucharist (First Communion)",
    description:
      "The Eucharist is the source and summit of the Christian life. Through this sacrament, we receive the Body and Blood of Christ.",
    category: "Initiation",
    iconKey: "chalice",
    schedule: {
      date: "Annually during Easter season",
      time: "10:00 AM",
      location: "Main Sanctuary",
    },
    requirements: [
      "Baptism certificate",
      "Completion of First Communion preparation classes",
      "Regular attendance at Mass",
      "Age requirement: 7-8 years old",
    ],
    contact: {
      name: "Very Rev. Fr. Sylvester Tolulope Oladunjoye",
      email: "eucharist@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
    registrationDeadline: "2 months before scheduled date",
  },
  {
    id: "reconciliation",
    name: "Reconciliation (Confession)",
    description:
      "The sacrament of Reconciliation offers us God's forgiveness and the opportunity to reconcile with God and the Church community.",
    category: "Healing",
    iconKey: "confessional",
    schedule: {
      date: "Every Saturday",
      time: "5:00 PM - 6:00 PM",
      location: "Confessionals",
    },
    requirements: ["Examination of conscience", "Sincere contrition", "Confession of sins"],
    contact: {
      name: "Parish Office",
      email: "confession@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: false,
  },
  {
    id: "anointing",
    name: "Anointing of the Sick",
    description:
      "This sacrament provides spiritual healing and strength to those who are seriously ill or facing surgery.",
    category: "Healing",
    iconKey: "flask",
    schedule: {
      date: "As needed",
      time: "By appointment",
      location: "Home or Hospital",
    },
    requirements: ["Serious illness or advanced age", "Request from individual or family"],
    contact: {
      name: "Parish Office",
      email: "anointing@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
  },
  {
    id: "matrimony",
    name: "Matrimony (Marriage)",
    description:
      "Marriage is a sacred covenant between a man and a woman, uniting them in Christ and calling them to live out their vocation together.",
    category: "Service",
    iconKey: "heart",
    schedule: {
      date: "By appointment",
      time: "By arrangement",
      location: "Main Sanctuary",
    },
    requirements: [
      "Marriage preparation classes",
      "Baptism certificates",
      "Freedom to marry certificate",
      "Pre-nuptial investigation",
      "6 months advance notice",
    ],
    contact: {
      name: "Very Rev. Fr. Sylvester Tolulope Oladunjoye",
      email: "marriage@stanthonygbaja.org",
      phone: "(234) 234 567 8912",
    },
    registrationRequired: true,
    registrationDeadline: "6 months before desired date",
  },
  {
    id: "holy-orders",
    name: "Holy Orders",
    description:
      "Holy Orders is the sacrament through which the mission entrusted by Christ to his apostles continues to be exercised in the Church.",
    category: "Service",
    iconKey: "priest",
    schedule: {
      date: "By arrangement with Diocese",
      time: "TBA",
      location: "Cathedral",
    },
    requirements: [
      "Call to priesthood or diaconate",
      "Completion of seminary formation",
      "Approval from Bishop",
      "Age requirement: 25 years or older",
    ],
    contact: {
      name: "Diocesan Vocation Office",
      email: "vocations@diocese.org",
      phone: "(234) 234 567 8900",
    },
    registrationRequired: true,
  },
];
