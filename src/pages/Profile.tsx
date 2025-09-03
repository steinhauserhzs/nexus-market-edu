import CompleteProfileForm from "@/components/profile/complete-profile-form";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil Completo</h1>
          <p className="text-muted-foreground">
            Gerencie todas suas informações pessoais e configurações da conta
          </p>
        </div>

        <CompleteProfileForm />
      </div>
    </div>
  );
};

export default Profile;