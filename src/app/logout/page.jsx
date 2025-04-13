"use client";
import React from "react";

function MainComponent() {
  const { signOut } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut({
          callbackUrl: "/",
          redirect: true,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to sign out");
      }
    };

    performLogout();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="text-red-500">{error}</div>
          <a
            href="/"
            className="mt-4 block text-center text-[#357AFF] hover:text-[#2E69DE]"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-center text-lg">Signing out...</div>
      </div>
    </div>
  );
}

export default MainComponent;
