import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  Separator,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { FiSend, FiX } from "react-icons/fi";
import { useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export function ChatScreen() {
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: input,
    };

    const botMessage: ChatMessage = {
      role: "bot",
      text: `You asked: "${input}" (${files.length} files loaded)`,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <Flex h="100vh" bg="gray.100">
      {/* Sidebar */}
      <Box
        w="320px"
        bg="white"
        p={5}
        display={{ base: "none", md: "block" }}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="lg" fontWeight="semibold" mb={5}>
          Your files
        </Text>

        {/* Upload Area */}
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="xl"
          p={8}
          textAlign="center"
          mb={5}
          cursor="pointer"
          transition="0.2s"
          _hover={{ borderColor: "blue.400", bg: "blue.50" }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Text fontWeight="medium">Upload files</Text>
          <Text fontSize="sm" color="gray.500">
            Drag & drop or click
          </Text>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Box>

        {/* File List */}
        <VStack align="stretch" gap={2}>
          {files.map((file, i) => (
            <Flex
              key={i}
              p={3}
              borderRadius="lg"
              bg="gray.50"
              align="center"
              justify="space-between"
              _hover={{ bg: "gray.100" }}
            >
              <Box maxW="75%">
                <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                  {file.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {(file.size / 1024).toFixed(1)} KB
                </Text>
              </Box>

              <IconButton
                size="xs"
                aria-label="Remove file"
                variant="ghost"
                onClick={() => removeFile(i)}
              >
                <FiX />
              </IconButton>
            </Flex>
          ))}
        </VStack>

        {files.length > 0 && (
          <>
            <Separator my={5} />
            <Text fontSize="sm" color="gray.500">
              {files.length} file(s)
            </Text>
          </>
        )}
      </Box>

      {/* Chat Area */}
      <Flex flex="1" direction="column" position="relative">
        {/* Messages */}
        <VStack
          flex="1"
          gap={5}
          align="stretch"
          px={{ base: 4, md: 10 }}
          py={6}
          overflowY="auto"
        >
          {messages.length === 0 && (
            <Text textAlign="center" color="gray.400" mt={20}>
              Upload files and start asking questions
            </Text>
          )}

          {messages.map((msg, i) => (
            <Flex
              key={i}
              justify={msg.role === "user" ? "flex-end" : "flex-start"}
            >
              {msg.role === "bot" && (
                <Avatar.Root size="sm" mr={3}>
                  <Avatar.Fallback name="AI" />
                </Avatar.Root>
              )}

              <Box
                maxW="600px"
                px={4}
                py={3}
                borderRadius="2xl"
                bg={msg.role === "user" ? "blue.500" : "white"}
                color={msg.role === "user" ? "white" : "gray.800"}
                boxShadow="sm"
              >
                <Text fontSize="sm">{msg.text}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>

        {/* Input */}
        <Box
          px={{ base: 4, md: 10 }}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <HStack
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="full"
            px={3}
            py={2}
            boxShadow="sm"
            _focusWithin={{
              borderColor: "blue.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
            }}
          >
            {/* Input */}
            <Input
              variant="subtle"
              placeholder="Ask something about your files..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              bg="transparent"
              _focus={{
                border: "none",
              }}
              _focusVisible={{ outline: "none" }}
              fontSize="sm"
              px={2}
            />

            {/* Send */}
            <IconButton
              aria-label="Send message"
              onClick={sendMessage}
              disabled={!input.trim()}
              borderRadius="full"
              size="sm"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700", transform: "scale(0.95)" }}
              _disabled={{
                bg: "gray.200",
                color: "gray.400",
                cursor: "not-allowed",
              }}
            >
              <FiSend />
            </IconButton>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}
