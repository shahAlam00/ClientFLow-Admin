import ClientBoarding from "./ClientBoarding";

// The onboarding form reads the route id and performs GET/PUT client API calls.
// Reusing it keeps the edit screen visually identical to the create screen.
const EditClient = () => <ClientBoarding />;

export default EditClient;
