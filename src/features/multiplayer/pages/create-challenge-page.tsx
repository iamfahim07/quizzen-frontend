import { Brain, Clock, Send, Trophy, Users } from "lucide-react";
import { useState } from "react";

import { useGetTopics } from "@/api/use-get-topics";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

const MOCK_FRIENDS = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar:
      "https://ui-avatars.com/api/?name=Alice+Johnson&background=9b87f5&color=fff",
    status: "online",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar:
      "https://ui-avatars.com/api/?name=Bob+Smith&background=4CAF50&color=fff",
    status: "offline",
  },
  {
    id: "3",
    name: "Carol Davis",
    avatar:
      "https://ui-avatars.com/api/?name=Carol+Davis&background=FF9800&color=fff",
    status: "online",
  },
  {
    id: "4",
    name: "David Wilson",
    avatar:
      "https://ui-avatars.com/api/?name=David+Wilson&background=2196F3&color=fff",
    status: "busy",
  },
];

export default function CreateChallengePage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [challengeType, setChallengeType] = useState<"topic" | "custom">(
    "topic"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: { data: topicsData } = { data: [] } } = useGetTopics();

  const handleSendChallenge = () => {
    console.log("Sending challenge:", {
      type: challengeType,
      topic: selectedTopic,
      opponent: selectedOpponent,
      customPrompt,
    });
  };

  const filteredUsers = MOCK_FRIENDS?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="fade-in animate-in duration-500">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Challenge</h1>
          <p className="text-muted-foreground">
            Challenge a user to a multiplayer quiz battle!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenge Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Challenge Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Challenge Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Challenge Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={challengeType === "topic" ? "default" : "outline"}
                    onClick={() => setChallengeType("topic")}
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Topic Quiz
                  </Button>
                  <Button
                    variant={challengeType === "custom" ? "default" : "outline"}
                    onClick={() => setChallengeType("custom")}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Custom AI
                  </Button>
                </div>
              </div>

              {challengeType === "topic" ? (
                /* Topic Selection */
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Topic</label>
                  <Select
                    value={selectedTopic}
                    onValueChange={setSelectedTopic}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Choose a quiz topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {topicsData.map((topic) => (
                        <SelectItem
                          key={topic._id}
                          value={topic._id ?? ""}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{topic.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* Custom Prompt */
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Custom AI Prompt
                  </label>
                  <Textarea
                    placeholder="Enter a custom prompt for AI-generated questions..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {/* Quiz Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Limit</label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="45">45 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opponent Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Select Opponent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Friends */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Search Users</label>
                <Input
                  placeholder="Search by username or email..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Friends List */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Online Users</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((friend) => (
                    <div
                      key={friend.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedOpponent === friend.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedOpponent(friend.id)}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>
                            {friend.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0">
                          <div
                            className={cn(
                              "flex justify-center items-center w-3 h-3 rounded-full border-2 border-white",
                              friend.status === "online"
                                ? "bg-green-500"
                                : friend.status === "busy"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "w-full h-full animate-ping rounded-full",
                                friend.status === "online"
                                  ? "bg-green-500"
                                  : "hidden"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{friend.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {friend.status}
                        </div>
                      </div>
                      {friend.status === "online" && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Available
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Challenge Button */}
              <Button
                className="w-full"
                disabled={
                  !selectedOpponent ||
                  (challengeType === "topic" ? !selectedTopic : !customPrompt)
                }
                onClick={handleSendChallenge}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Challenge
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Preview */}
        {(selectedTopic || customPrompt) && selectedOpponent && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Challenge Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">30 second timer per question</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Best of 10 questions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
