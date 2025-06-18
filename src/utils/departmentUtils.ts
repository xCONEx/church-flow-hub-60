
import { Department } from '@/types';

export const getDepartmentHierarchy = (departments: Department[]) => {
  const parentDepts = departments.filter(dept => !dept.isSubDepartment);
  return parentDepts.map(parent => ({
    ...parent,
    subDepartments: departments.filter(dept => dept.parentDepartmentId === parent.id)
  }));
};
