interface ProfileHeroProps {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  onEdit?: () => void;
  editButtonText?: string;
}

export function ProfileHero({ 
  name, 
  username, 
  email, 
  phone,
  avatarUrl,
  onEdit,
  editButtonText = "EDITAR PERFIL"
}: ProfileHeroProps) {
  // Generar inicial del nombre para avatar
  const initial = name.charAt(0).toUpperCase();

  return (
    <section className="bg-black/60 rounded-xl border border-qoder-dark-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-2xl font-bold text-white">
            {initial}
          </div>
        )}
        
        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-sm text-gray-400">
            @{username} • {email}
          </p>
          {phone && (
            <p className="text-sm text-gray-400">
              📞 {phone}
            </p>
          )}
        </div>
      </div>
      
      {/* Botón de editar */}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="qoder-dark-button-primary px-6 py-3 rounded-lg whitespace-nowrap"
        >
          {editButtonText}
        </button>
      )}
    </section>
  );
}