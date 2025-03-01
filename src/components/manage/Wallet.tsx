import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { IAgentInfo } from "@/interfaces/agent";
import tokenApi from "@/services/token.service";
import TokenCard from "../assets/TokenCard";
import { Button, Spinner } from "@heroui/react";
import { formatUSD } from "@/utils/format.util";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import TokenPriceChart from "./chart/TokenPriceChart";
import walletApi from "@/services/wallet.service";
import toast from "react-hot-toast";
import { ITokenAvailable } from "@/interfaces/token";

export default function Wallet({ agentInfo }: { agentInfo: IAgentInfo }) {
  const navigate = useNavigate();
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const {
    data: tokenBalances,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tokenBalances", agentInfo.id],
    queryFn: () =>
      tokenApi.getTokenBalance(agentInfo.id.toString() || "", {
        addUsdBalance: true,
        addTokenInfo: true,
        includeTokenBase: true,
        chainId: agentInfo.chainId,
      }),
  });

  const { data: balanceChartData } = useQuery({
    queryKey: ["balanceChartData", agentInfo.id],
    queryFn: () => walletApi.getBalanceChart(agentInfo.id.toString() || ""),
  });

  const pnlValue = useMemo(() => {
    if (
      !tokenBalances ||
      tokenBalances.balance === 0 ||
      tokenBalances.equity === 0
    ) {
      return null;
    }
    return tokenBalances.balance - tokenBalances.equity;
  }, [tokenBalances]);

  const pnlText = useMemo(() => {
    if (!pnlValue || !tokenBalances) {
      return null;
    }

    const pnlPercent = tokenBalances.performance * 100;

    if (pnlValue === 0) {
      return `$${pnlValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`;
    }

    if (pnlValue > 0) {
      return `+$${pnlValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} (+${pnlPercent.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}%)`;
    }

    return `-$${Math.abs(pnlValue).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} (${pnlPercent.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}%)`;
  }, [tokenBalances, pnlValue]);

  const pnlTextColor = useMemo(() => {
    if (!pnlValue || !tokenBalances) {
      return null;
    }
    return pnlValue > 0 ? "text-green-600" : "text-red-500";
  }, [pnlValue, tokenBalances]);

  const TokenList = useMemo(() => {
    if (!tokenBalances || tokenBalances.tokens.length === 0) {
      return (
        <div className="text-sm text-center flex-1 flex justify-center items-center">
          Token not found
        </div>
      );
    }

    const handleFaucet = (agentId: number, tokenInfo: ITokenAvailable) => {
      setIsFaucetLoading(true);
      toast.promise(
        async () => {
          try {
            await tokenApi.faucetToken(agentId.toString(), tokenInfo);
            refetch();
          } catch (error) {
            console.error(error);
            throw new Error("Faucet failed");
          } finally {
            setIsFaucetLoading(false);
          }
        },
        {
          loading: "Fauceting token...",
          success: `${tokenInfo.symbol} fauceted successfully`,
          error: (error) => error.response.data.message,
        }
      );
    };

    return (
      <div className="flex flex-col space-y-4">
        {tokenBalances.tokens.map((token, key) => {
          const tokenValue = tokenBalances.tokenValues[key];
          const tokenInfo = tokenBalances.tokenInfo?.find(
            (t) => t.symbol.toLowerCase() === token[0].toLowerCase()
          );
          if (!tokenInfo) {
            return null;
          }
          return (
            <TokenCard
              key={key}
              agentId={agentInfo.id}
              token={token}
              tokenInfo={tokenInfo}
              balanceUsd={tokenValue}
              handleFaucet={() => handleFaucet(agentInfo.id, tokenInfo)}
              isFaucetLoading={isFaucetLoading}
            />
          );
        })}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentInfo.id, isFaucetLoading, tokenBalances]);
  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {tokenBalances?.balance
                ? formatUSD(tokenBalances?.balance ?? 0)
                : "$0.00"}
            </div>
            {pnlText && <div className={`${pnlTextColor}`}>{pnlText}</div>}
          </div>
          <div className="h-[150px] w-full mt-6">
            <TokenPriceChart
              data={
                balanceChartData
                  ? balanceChartData.map((item) => ({
                      ...item,
                      balance: Number(item.balance),
                    }))
                  : []
              }
            />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center px-3 space-x-3 mb-4 mt-6">
        <Button
          variant="solid"
          size="lg"
          className="w-full rounded-full text-white bg-primary"
          startContent={<ArrowDownIcon className="w-5 h-5 stroke-white" />}
          onPress={() => navigate(`/manage/${agentInfo.id}/deposit`)}
        >
          Deposit
        </Button>
        <Button
          variant="solid"
          size="lg"
          className="w-full rounded-full text-[#292C33] bg-[#F8F9FB]"
          startContent={<ArrowUpIcon className="w-5 h-5 stroke-[#292C33]" />}
          onPress={() => navigate(`/manage/${agentInfo.id}/withdraw`)}
        >
          Withdraw
        </Button>
      </div>
      <div className="font-medium mt-6 mb-3">Tokens</div>
      {isLoading ? (
        <div className="flex-1 flex flex-col space-y-4 items-center justify-center h-full">
          <Spinner />
          <div className="text-sm">Loading...</div>
        </div>
      ) : (
        TokenList
      )}
    </div>
  );
}
