"use client";
import {Button} from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function RunAgentButton() {

    const [ isPending, startTransition ] = useTransition();

    const router = useRouter();

    const handleRunAgent = async () => {
        startTransition( async() => {
            try {
                const response = await fetch("/api/agent/run", {method: "POST",});

                const result = await response.json();

                if (!response.ok) {
                   console.error("Agent run failed:", result.error);
                }

            console.log(result);

                router.refresh();

            } catch (error) {
                console.error("Agent run error:", error);
                return;
            }
        });
    };

    return (
        <Button 
        className="w-full"
        variant = {"outline"}
        onClick={handleRunAgent}
        disabled={isPending}
        >
            { isPending ? (
              
              <>
              <  Loader2Icon className = "spinner-icon" />
                Running Agent...
              </>
            ) : (
                "Run Agent Now"
            )}
           
        </Button>
    );
}