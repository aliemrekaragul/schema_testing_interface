import React, { useState, useEffect } from "react";
import { Text, Textarea, Button, Box, VStack, Heading, Center, HStack, } from "@chakra-ui/react";
import { Card, CardBody } from "@chakra-ui/react"; 
import Select from "react-select";
import llmPrompts from "../data/llmPrompts.json";
import envVariables from "../data/envVariables.json";


const LegalSearchInterface = () => {

  const llmApiKey =  envVariables.GROQ
  const defaultLlmPrompt = llmPrompts.prompt
  const defaultSchema = JSON.stringify(llmPrompts.hukuk_schema)
  const defaultSearchTerm = llmPrompts.hukuk_searchTerm

  const [category, setCategory] = useState("hukuk");
  const [courts, setCourts] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState([{ value: 'all', label: 'Tümü' }]);
  const [llmPrompt, setLlmPrompt] = useState(defaultLlmPrompt);
  const [schemaInput, setSchemaInput] = useState(category === "hukuk" ? JSON.stringify(llmPrompts.hukuk_schema) : JSON.stringify(llmPrompts.ceza_schema));
  const [searchTerm, setSearchTerm] = useState(category === "hukuk" ? llmPrompts.hukuk_searchTerm : llmPrompts.ceza_searchTerm);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category === "hukuk") {
      setCourts([
        { value: "Bölge Adliye Mahkemesi", label: "Bölge Adliye Mahkemesi" },
        { value: "Asliye Hukuk Mahkemesi", label: "Asliye Hukuk Mahkemesi" },
        { value: "Sulh Hukuk Mahkemesi", label: "Sulh Hukuk Mahkemesi" },
        { value: "Aile Mahkemesi", label: "Aile Mahkemesi" },
        { value: "İş Mahkemesi", label: "İş Mahkemesi" },
        { value: "Ticaret Mahkemesi", label: "Ticaret Mahkemesi" },
        { value: "Kadastro Mahkemesi", label: "Kadastro Mahkemesi" },
        { value: "İcra Hukuk Mahkemesi", label: "İcra Hukuk Mahkemesi" },
        { value: "Tüketici Mahkemesi", label: "Tüketici Mahkemesi" },
        { value: "Fikrî ve Sınai Haklar Hukuk Mahkemesi", label: "Fikrî ve Sınai Haklar Hukuk Mahkemesi", },
        { value: "Yargıtay", label: "Yargıtay" },
      ]);
    } else {
      setCourts([
        { value: "Asliye Ceza Mahkemesi", label: "Asliye Ceza Mahkemesi" },
        { value: "Ağır Ceza Mahkemesi", label: "Ağır Ceza Mahkemesi" },
        { value: "Sulh Ceza Hakimliği", label: "Sulh Ceza Hakimliği" },
        { value: "Cocuk Mahkemesi", label: "Cocuk Mahkemesi" },
        { value: "Çocuk Ağır Ceza Mahkemesi", label: "Çocuk Ağır Ceza Mahkemesi", },
      ]);
    }
  }, [category]);
  useEffect(() => {
    setSearchTerm(category === "hukuk" ? llmPrompts.hukuk_searchTerm : llmPrompts.ceza_searchTerm);
  }, [category]);
  useEffect(() => {
    const newSchema = category === "hukuk" ? llmPrompts.hukuk_schema : llmPrompts.ceza_schema;
    setSchemaInput(JSON.stringify(newSchema, null, 2));
  }, [category]);

  const handleSimpleSearch = async () => {
    setLoading(true);
    setSearchResults([]);

    try {
      const systemPrompt = `${llmPrompt}\n${schemaInput}`;
      const llmResponse = await makeLLMRequest(systemPrompt, searchTerm); 
      
      // TODO: Burada DB search requesti yapılacak
      setSearchResults([
        `${llmResponse}`
      ]);
    } catch (error) {
      console.error("LLM request failed:", error);
      setSearchResults(["LLM request failed. Please try again."]);
    }
    
    setLoading(false);
  };

  const makeLLMRequest = async (llmPrompt, searchTerm) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${llmApiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: llmPrompt },
          { role: "user", content: searchTerm }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.1,
        max_tokens: 8000,
        top_p: 1,
        stream: false,
        stop: null
      })
    });
  
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  
    const data = await response.json();
    return data.choices[0].message.content
  };

  const resetSimpleSearch = () => {
    setLlmPrompt(defaultLlmPrompt);
    setSchemaInput(defaultSchema);
    setSearchTerm(defaultSearchTerm);
    setSearchResults([]);
  };
  return (
    <Center>
      <Box className="container" mx="auto" p={50} width="50%">
        <Heading className="text-xl font-bold mb-4" mb={4}>
          Veysel'in LLM Zamazingosu
        </Heading>
        <VStack spacing={4}  mb={4}>
          <Textarea
            placeholder="Aramak istediğiniz karara dair detayları girin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="100%"
            height={30}
          />
        </VStack>
        <div style={{ display: 'flex', gap: '10px', marginBottom: 25, width:"100%" }}>
          <div style={{ width: "20%" }}>
            <Select
              value={{
                value: category,
                label: category.charAt(0).toUpperCase() + category.slice(1),
              }}
              onChange={(option) => setCategory(option.value)}
              options={[
                { value: "hukuk", label: "Hukuk" },
                { value: "ceza", label: "Ceza" },
              ]}
            />
          </div>

          <div style={{ width: "80%" }}>
            <Select
              isMulti
              placeholder="Mahkeme Seçin"
              value={selectedCourts}
              onChange={(selectedOptions) => setSelectedCourts(selectedOptions)}
              options={[{ value: "all", label: "Tümü" }, ...courts]}
            />
          </div>
        </div>

        <HStack spacing={4} mb={4} justifyContent="center">
          <Button onClick={handleSimpleSearch} isLoading={loading}>
            {loading ? "Gönderiyor..." : "Gönder"}
          </Button>
          <Button variant="outline" onClick={resetSimpleSearch}>
            Sıfırla
          </Button>
        </HStack>
        <Text fontSize="md" fontWeight="bold" mb={2}>
          LLM inputs
        </Text>
        <VStack spacing={4} mb={4}>
          <Textarea
            placeholder="LLM Prompt giriniz..."
            value={llmPrompt}
            onChange={(e) => setLlmPrompt(e.target.value)}
            width="100%"
            height={70} 
          />
          <Textarea
            placeholder="Şema giriniz..."
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            width="100%"
            height={300}
            fontFamily="monospace"
            padding="10px"
            border="1px solid #ccc"
            borderRadius="4px"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </VStack>
        <Box mt={8}>
          <Heading size="md" mb={4}>
            LLM Outputs
          </Heading>
          {loading && <p>LLM'den yanıt alınıyor...</p>}
          {!loading && searchResults.length > 0
            ? searchResults.map((result, index) => (
                <Card key={index} mb={4}>
                  <CardBody>
                    <p>{result}</p>
                  </CardBody>
                </Card>
              ))
            : !loading && <p>Arama terimi giriniz.</p>}
        </Box>
      </Box>
    </Center>
  );
};

export default LegalSearchInterface;
