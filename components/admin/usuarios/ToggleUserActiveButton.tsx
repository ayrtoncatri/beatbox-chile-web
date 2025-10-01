"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PowerIcon } from "@heroicons/react/24/outline";
import { toggleUserActive } from "@/app/admin/usuarios/actions";

function ToggleButton({ 
  isActive, 
  label, 
  disabledReason 
}: { 
  isActive: boolean;
  label: string;
  disabledReason?: string;
}) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending || !!disabledReason}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold shadow-sm transition-all
        ${isActive
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"}
        ${disabledReason ? "opacity-50 cursor-not-allowed" : ""}`}
      title={disabledReason}
    >
      <PowerIcon className="w-4 h-4" />
      {pending ? "Guardando..." : label}
    </button>
  );
}

export default function ToggleUserActiveButton({
  id,
  isActive,
  disabledReason,
}: {
  id: string;
  isActive: boolean;
  disabledReason?: string;
}) {
  const initialState = { ok: false, error: null };
  const [state, formAction] = useActionState(toggleUserActive, initialState);

  const label = isActive ? "Desactivar" : "Activar";

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={(!isActive).toString()} />
      <ToggleButton 
        isActive={isActive}
        label={label}
        disabledReason={disabledReason}
      />
    </form>
  );
}