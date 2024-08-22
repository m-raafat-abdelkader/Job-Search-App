/**
 * Defines system roles with their corresponding names.
 * @type {Object}
 * @property {string} USER - The role name for regular users.
 * @property {string} COMPANY_HR - The role name for HR staff.
*/
export const systemRoles = {
    USER: "User",
    COMPANY_HR: "companyHR"
}

const {USER, COMPANY_HR} = systemRoles


/**
 * Defines role combinations used within the application.
 * @type {Object}
 * @property {string[]} USER - An array containing the USER role name.
 * @property {string[]} COMPANY_HR - An array containing the COMPANY_HR role name.
 * @property {string[]} USERANDCOMPANY_HR - An array containing both USER and COMPANY_HR role names.
*/
export const roles = {
    USER: [USER],
    COMPANY_HR: [COMPANY_HR],
    USERANDCOMPANY_HR: [USER, COMPANY_HR]
}

