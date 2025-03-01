import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { PauseIcon } from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { formatUSD, formatPercent } from "@/utils/format.util";
import type { IAgent } from "@/interfaces/agent.d";

interface AgentCardProps {
  agent: IAgent;
  onToggleStartPause: (agentId: number, isRunning: boolean) => Promise<string>;
}

export default function AgentCard({
  agent,
  onToggleStartPause,
}: AgentCardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStartPause = async (
    agentId: number,
    isRunning: boolean
  ) => {
    try {
      setIsLoading(true);
      await toast.promise(
        async () => {
          const status = await onToggleStartPause(agentId, isRunning);
          return status;
        },
        {
          loading: `${isRunning ? "Pausing" : "Starting"}...`,
          success: (status) => `Agent ${agentId} is ${status}!`,
          error: `Toggle start/pause failed!`,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pnl = useMemo(() => {
    const equity = agent.equity ?? 0;
    const balance = agent.totalBalance ?? 0;
    return equity === 0 ? 0 :(balance - equity);
  }, [agent])

  const pnlPercent = useMemo(() => {
    const performance = agent.performance ?? 0;
    return performance === 0 ? 0 : (performance * 100);
  }, [agent]);

  const pnlTextColor = useMemo(() => {
    if (pnl === 0) return "text-gray-500";
    return pnl > 0 ? "text-green-600" : "text-red-500";
  }, [pnl]);

  const pnlText = useMemo(() => {
    if (pnl === 0) return "-";
    if (pnl > 0) return `+${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} (+${formatPercent(pnlPercent)})`;
    return `${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${formatPercent(pnlPercent)})`;
  }, [pnl, pnlPercent]);

  return (
    <div
      className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col space-y-6 w-full cursor-pointer"
      onClick={() => navigate(`/manage/${agent.id}`)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {agent.chainId ? (
            <img
              src={agent.chainInfo?.iconUrl}
              alt={agent.chainInfo?.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex justify-center items-center">
              {agent.chainInfo?.name}
            </div>
          )}
          <div>
            <div className="font-medium text-lg">{agent.name}</div>
            <p className="text-xs text-gray-500">
              Created at: {new Date(agent.createdAt).toLocaleString()}
            </p>
            <div></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-500">Total Balance</div>
        <div className="text-sm text-gray-500">Current Profit</div>
        <div className="text-xl">
          {agent?.totalBalance
            ? `${formatUSD(agent.totalBalance)} USD`
            : "$0.00"}
        </div>
        <div
          className={`text-xl ${pnlTextColor}`}
        >
          {pnlText}
        </div>
      </div>
      <div className="flex space-x-3">
        <Button
          onPress={() => handleToggleStartPause(agent.id, agent.isRunning)}
          isDisabled={isLoading}
          className={`rounded-full font-semibold flex-1 ${agent.isRunning ? "text-secondary bg-secondary-background" : "text-primary bg-secondary-background border-primary border bg-white"}`}
          variant={agent.isRunning ? "solid" : "bordered"}
          startContent={
            agent.isRunning ? (
              <PauseIcon className="w-5 h-5 text-secondary" strokeWidth={4} />
            ) : (
              <PlayIcon className="w-5 h-5 text-primary" strokeWidth={4} />
            )
          }
        >
          {agent.isRunning ? "Pause" : "Start"}
        </Button>
      </div>
    </div>
  );
}
