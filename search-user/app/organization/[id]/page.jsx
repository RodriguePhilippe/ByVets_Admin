import OrganizationForm from "../../../components/OrganizationForm";

export default async function OrganizationPage({params}) {
    const {id} = await params;

    return (
        <OrganizationForm organizationId={id} />
    )
}