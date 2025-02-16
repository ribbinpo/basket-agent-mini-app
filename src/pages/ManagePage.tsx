import { useParams } from "react-router-dom";
import { Tabs, Tab, Spinner, Button } from "@heroui/react";

import { Page } from "@/components/base/Page";
import Header from "@/components/layout/Header";
import ManageAsset from "@/components/manage/Asset";
import ManageKnowledge from "@/components/manage/Knowledge";
import ManageSettings from "@/components/manage/Settings";
import { useQuery } from "@tanstack/react-query";
import agentApi from "@/services/agent.service";
import { useState } from "react";
import { IKnowledge } from "@/interfaces/knowledge";

export default function ManagePage() {
  const { id } = useParams();
  const [tab, setTab] = useState("deposit");
  const { data: agentInfo, isLoading } = useQuery({
    queryKey: ["agentInfo", id],
    queryFn: () => agentApi.getAgentId(+(id || 0)),
  });
  const [knowledgeBase, setKnowledgeBase] = useState<IKnowledge[]>(
    agentInfo?.knowledge ?? []
  );
  const handleSaveKnowledge = () => {
    agentApi.updateAgent(+(id || 0), {
      knowledges: knowledgeBase.map((knowledge) => ({
        name: knowledge.name,
        content: knowledge.content,
      })),
    });
  };
  const handleSaveSettings = () => {
    console.log("save settings");
  };
  if (!id) {
    return <div>Agent ID is required</div>;
  }
  if (!agentInfo) {
    return <div>Agent not found</div>;
  }
  return (
    <Page back={true}>
      <div className="w-full min-h-screen p-4 pb-6 flex flex-col">
        <Header title={`AI Agent Settings`} />
        <div className="flex-1">
          {isLoading ? (
            <div className="flex-1 flex flex-col space-y-4 items-center justify-center h-full">
              <Spinner />
              <div className="text-sm">Loading...</div>
            </div>
          ) : (
            <Tabs
              aria-label="Tabs radius"
              radius="full"
              fullWidth
              selectedKey={tab}
              onSelectionChange={(key) => setTab(key as string)}
            >
              <Tab key="deposit" title="Deposit">
                <ManageAsset agentInfo={agentInfo} />
              </Tab>
              <Tab key="knowledge" title="Knowledge">
                <ManageKnowledge
                  agentInfo={agentInfo}
                  setKnowledgeBase={setKnowledgeBase}
                />
              </Tab>
              <Tab key="settings" title="Settings">
                <ManageSettings agentInfo={agentInfo} />
              </Tab>
            </Tabs>
          )}
        </div>
        {tab !== "deposit" && (
          <Button
            className="bg-[#FF4F29] rounded-full text-white p-4 w-full"
            variant="solid"
            onPress={
              tab === "knowledge" ? handleSaveKnowledge : handleSaveSettings
            }
          >
            Save
          </Button>
        )}
      </div>
    </Page>
  );
}
