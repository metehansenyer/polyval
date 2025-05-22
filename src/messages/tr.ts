export const trMessages = {
  required: "Bu alan zorunludur",
  invalid_type: "Geçersiz tip",
  
  // String validators
  string: {
    min: (min: number) => `En az ${min} karakter uzunluğunda olmalıdır`,
    max: (max: number) => `En fazla ${max} karakter uzunluğunda olmalıdır`,
    length: (len: number) => `Tam olarak ${len} karakter uzunluğunda olmalıdır`,
    email: "Geçersiz e-posta adresi",
    url: "Geçersiz URL",
    uuid: "Geçersiz UUID",
    cuid: "Geçersiz CUID",
    datetime: "Geçersiz tarih/saat formatı",
    ip: "Geçersiz IP adresi",
    regex: "Geçersiz format",
    startsWith: (value: string) => `"${value}" ile başlamalıdır`,
    endsWith: (value: string) => `"${value}" ile bitmelidir`,
    numeric: "Sadece sayısal karakterler içermelidir"
  },
  
  // Number validators
  number: {
    min: (min: number) => `En az ${min} olmalıdır`,
    max: (max: number) => `En fazla ${max} olmalıdır`
  },
  
  // Date validators
  date: {
    min: (date: Date) => `${date.toLocaleDateString()} tarihinden sonra olmalıdır`,
    max: (date: Date) => `${date.toLocaleDateString()} tarihinden önce olmalıdır`
  },
  
  // Boolean validators
  boolean: {
    true: "İşaretli olmalıdır",
    false: "İşaretli olmamalıdır"
  },
  
  // Relation validators
  equals: (field: string) => `${field} alanı ile eşleşmelidir`,
  notEquals: (field: string) => `${field} alanı ile eşleşmemelidir`
};
