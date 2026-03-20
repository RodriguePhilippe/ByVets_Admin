"use client"

import React from "react";
import { Formik, FieldArray } from "formik";
import * as Yup from 'yup';

const organizationSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    tva_number: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    is_peppol_active: Yup.boolean(),
    licenses: Yup.array()
        .of(
            Yup.object().shape({
                year: Yup.number().required("Year is required"),
                status: Yup.string().required("Status is required"),
            })
        )
        .min(1, "At least one license is required")
});

export default function OrganizationForm({organizationId}) {
    const [organization, setOrganization] = React.useState(null);

    React.useEffect(() => {
        async function fetchOrganization(){
            try {
                const res = await fetch(`http://localhost:8000/api/rodrigue/organization/${organizationId}`)
                const json = await res.json()
                setOrganization(json)
            } catch (error) {
                console.error("Erreur API :", error)
            }
        }
        fetchOrganization();
    }, [organizationId]);

    function handleSubmit(values) {
        async function updateOrganization(values) {
            try {
                const res = await fetch(`http://localhost:8000/api/rodrigue/organization/${organizationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
                })
                const json = await res.json()
                setOrganization(json)
            } catch (error) {
                console.error("Erreur API :", error)
            }
        }
        updateOrganization(values);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            {organization ? (
                <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        Modifier l'organisation
                    </h2>

                    <Formik
                        enableReinitialize
                        initialValues={{
                            name: organization.name || "",
                            tva_number: organization.tva_number || "",
                            is_peppol_active: organization.is_peppol_active || false,
                            is_alcyonnaire: organization.is_alcyonnaire || false,
                            licenses: organization.licenses || [],
                        }}
                        validationSchema={organizationSchema}
                        onSubmit={(values) => handleSubmit(values)}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              resetForm,
                          }) => (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.name}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    {touched.name && errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        TVA Number
                                    </label>
                                    <input
                                        type="text"
                                        name="tva_number"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.tva_number}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    {touched.tva_number && errors.tva_number && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.tva_number}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_peppol_active"
                                            onChange={handleChange}
                                            checked={values.is_peppol_active}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                            Peppol
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_alcyonnaire"
                                            onChange={handleChange}
                                            checked={values.is_alcyonnaire}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                            Alcyonnaire
                                        </span>
                                    </label>
                                </div>

                                <FieldArray name="licenses">
                                    {({ push, remove }) => (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Licenses
                                            </h3>

                                            {values.licenses.map((license, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4 bg-gray-50 space-y-3"
                                                >
                                                    <div>
                                                        <label className="block text-sm text-gray-600">
                                                            Year
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name={`licenses.${index}.year`}
                                                            value={values.licenses[index].year}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        />
                                                        {touched.licenses?.[index]?.year &&
                                                            errors.licenses?.[index]?.year && (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                    {errors.licenses[index].year}
                                                                </p>
                                                            )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-gray-600">
                                                            Status
                                                        </label>
                                                        <select
                                                            name={`licenses.${index}.status`}
                                                            value={values.licenses[index].status}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        >
                                                            <option value="pending">En attente</option>
                                                            <option value="paid">Payée</option>
                                                        </select>
                                                        {touched.licenses?.[index]?.status &&
                                                            errors.licenses?.[index]?.status && (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                    {errors.licenses[index].status}
                                                                </p>
                                                            )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition cursor-pointer"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            ))}

                                            {typeof errors.licenses === "string" && (
                                                <p className="text-sm text-red-500">
                                                    {errors.licenses}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => push({ year: new Date().getFullYear(), status: "" })}
                                                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg cursor-pointer"
                                            >
                                                Ajouter une license
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition cursor-pointer"
                                    >
                                        Enregistrer
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => resetForm()}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    Aucune organisation trouvée
                </div>
            )}
        </div>
    );
}