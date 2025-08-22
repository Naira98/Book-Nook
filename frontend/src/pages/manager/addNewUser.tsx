import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import AuthLayout from "../../components/auth/AuthLayout";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useRegister } from "../../hooks/auth/useRegister";
import type { AddNewUserFormValues } from "../../types/auth";

export default function AddNewUser() {
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const { register, isPending } = useRegister(setEmailSent, setResendCountdown);

  useEffect(() => {
    if (emailSent && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailSent, resendCountdown]);

  const validate = (values: AddNewUserFormValues) => {
    const errors: Partial<AddNewUserFormValues> = {};
    if (!values.firstName) errors.firstName = "First Name is required";
    if (!values.lastName) errors.lastName = "Last Name is required";
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.nationalId) errors.nationalId = "National ID is required";
    if (!values.phoneNumber) errors.phoneNumber = "Phone Number is required";
    if (!values.password) errors.password = "Password is required";
    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!values.role) errors.role = "Role is required";
    return errors;
  };

  const RegisterformData = [
    {
      name: "firstName",
      type: "text",
      placeholder: "First Name",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "lastName",
      type: "text",
      placeholder: "Last Name",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email Address",
    },
    {
      name: "nationalId",
      type: "text",
      placeholder: "National ID",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "phoneNumber",
      type: "text",
      placeholder: "Phone Number",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
    },
    {
      name: "role",
      type: "select",
      placeholder: "Select Role",
      options: [
        { label: "Employee", value: "employee" },
        { label: "Courier", value: "courier" },
      ],
      containerClassName: "!w-full",
    },
  ];

  const onSubmit = (values: AddNewUserFormValues) => {
    register(values);
  };

  return (
    <AuthLayout>
   
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex w-full flex-col p-6 md:w-1/2 lg:p-8">
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, submitting, pristine }) => (
              <form onSubmit={handleSubmit} className="space-y-4">
                {RegisterformData.map((field) => (
                  <Field key={field.name} name={field.name}>
                    {({ input, meta }) => (
                      <div className={field.containerClassName}>
                        {field.type === "select" ? (
                          <select
                            {...input}
                            className="w-full border p-2 rounded"
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <TextInput
                            {...input}
                            type={field.type}
                            placeholder={field.placeholder}
                            error={meta.touched && meta.error}
                          />
                        )}
                      
                      </div>
                    )}
                  </Field>
                ))}

                <MainButton
                  type="submit"
                  disabled={submitting || pristine || isPending}
                  className="w-full"
                  label="Add User"
                  loading={isPending}
                />
              </form>
            )}
          />
        </div>
      </div>
    </AuthLayout>
  );
}




// import { useEffect, useState } from "react";
// import { Field, Form } from "react-final-form";
// import AuthLayout from "../../components/auth/AuthLayout";
// import MainButton from "../../components/shared/buttons/MainButton";
// import TextInput from "../../components/shared/formInputs/TextInput";
// import { useRegister } from "../../hooks/auth/useRegister";
// import type { AddNewUserFormValues } from "../../types/auth";


// export default function AddNewUser() {
//   const [resendCountdown, setResendCountdown] = useState<number>(30);
//   const [emailSent, setEmailSent] = useState<boolean>(false);

//   const { register, isPending } = useRegister(setEmailSent, setResendCountdown);

//   useEffect(() => {
//     if (emailSent && resendCountdown > 0) {
//       const timer = setTimeout(() => {
//         setResendCountdown((c) => c - 1);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [emailSent, resendCountdown]);

//   const validate = (values: AddNewUserFormValues) => {
//     const errors: Partial<AddNewUserFormValues> = {};
//     // No additional validation logic needed here for activation.
//     if (!values.firstName) errors.firstName = "First Name is required";
//     if (!values.lastName) errors.lastName = "Last Name is required";
//     if (!values.email) {
//       errors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
//       errors.email = "Invalid email address";
//     }
//     if (!values.nationalId) {
//       errors.nationalId = "National ID is required";
//     }
//     if (!values.phoneNumber) {
//       errors.phoneNumber = "Phone Number is required";
//     }
//     if (!values.password) errors.password = "Password is required";
//     if (!values.confirmPassword) {
//       errors.confirmPassword = "Confirm Password is required";
//     } else if (values.password !== values.confirmPassword) {
//       errors.confirmPassword = "Passwords do not match";
//     }
//     if (!values.role) errors.role = "role is required "

//     return errors;
//   };

//   const RegisterformData = [
//     {
//       name: "firstName",
//       type: "text",
//       placeholder: "First Name",
//       containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
//     },
//     {
//       name: "lastName",
//       type: "text",
//       placeholder: "Last Name",
//       containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
//     },
//     {
//       name: "email",
//       type: "email",
//       placeholder: "Email Address",
//     },
//     {
//       name: "nationalId",
//       type: "text",
//       placeholder: "National ID",
//       containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
//     },
//     {
//       name: "phoneNumber",
//       type: "text",
//       placeholder: "Phone Number",
//       containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
//     },
//     {
//       name: "password",
//       type: "password",
//       placeholder: "Password",
//     },
//     {
//       name: "confirmPassword",
//       type: "password",
//       placeholder: "Confirm Password",
//     },
//     {
//       name: "role",
//       type: "select",   // custom type so we can render <select>
//       placeholder: "Select Role",
//       options: [
//         { label: "Employee", value: "employee" },
//         { label: "Courier", value: "courier" },
//       ],
//       containerClassName: "!w-full",
//     }
//   ];

//   const onSubmit = (values: AddNewUserFormValues) => {
//     register(values);
//   };
//   // Add the form rendering using react-final-form
//   return (
//     <AuthLayout>
//       <div className="flex flex-1 flex-col overflow-auto ">

//         <div className="flex w-full flex-col  p-6 md:w-1/2 lg:p-8">
//           <Form
//             onSubmit={onSubmit}
//             validate={validate}
//             render={({ handleSubmit, submitting, pristine }) => (
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {RegisterformData.map((field) => (
//                   <div key={field.name} className={field.containerClassName}>
//                     {field.type === "select" ? (
//                       <select name={field.name} className="w-full border p-2 rounded">
//                         <option value="">{field.placeholder}</option>
//                         {field.options?.map((opt) => (
//                           <option key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <input
//                         type={field.type}
//                         name={field.name}
//                         placeholder={field.placeholder}
//                         className="w-full border p-2 rounded"
//                       />
//                     )}
//                   </div>
//                 ))}


//                 <MainButton

//                   disabled={submitting || pristine || isPending}
//                   className="w-full"
//                   label="Add User"
//                   loading={isPending}
//                 />


//               </form>
//             )}
//           />
//         </div>
//       </div>
//     </AuthLayout>
//   );
// }
