import { Button, Col, Form, Input, Modal, Row, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useReduxDispatch, useReduxSelector } from "../../../hooks";
import {
  callMessage,
  setCurrentWord,
  toggleActionWordModal,
} from "../../../redux/slice";
import _, { capitalize, omit } from "lodash";

import styles from "./ActionWordModal.module.scss";
import { useForm } from "antd/es/form/Form";
import { AiFillPlusCircle } from "react-icons/ai";
import clsx from "clsx";
import { ImCancelCircle } from "react-icons/im";
import { Definition, Example, Pronunciation, Word } from "../../../types";
import Pronunciations from "../../Vocabulary/Pronunciations";
import Definitions from "../../Vocabulary/Definitions";
import UploadImage from "../../Upload/UploadImage/UploadImage";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { WordService } from "../../../service";
import { EventEmit, MessageType } from "../../../constants";
import emitter from "../../../utils/EventEmitter";
import DebounceSelect from "../../DebounceSelect";
import { FormattedMessage } from "react-intl";

const generateId = () => `new-${Math.random().toString(36)}-${Date.now()}`;

const partOfSpeeches: string[] = [
  "noun",
  "pronoun",
  "verb",
  "adverb",
  "adjective",
  "preposition",
  "conjunction",
  "interjection",
  "idiom",
  "phrase",
  "determiner",
];

const variations: string[] = [
  "comparative", // So sánh hơn
  "superlative", // So sánh nhất
  "plural", // Danh từ số nhiều
  "possessive nouns", // Danh từ sở hữu
  "object pronouns", // Tân ngữ
  "possessive pronouns", // Đại từ sở hữu
];

type Option = {
  value: string;
  label: string;
};

const ActionWordModal: React.FC = () => {
  const dispatch = useReduxDispatch();
  const closeActionWordModal = () => dispatch(toggleActionWordModal(false));
  const resetCurrentWord = () => dispatch(setCurrentWord(null!));

  const [, setReloadContent] = useState<boolean>(true);

  const reloadUI = () => setReloadContent((prev) => !prev);

  const modalStatus = useReduxSelector(
    (state) => state.app.openActionWordModal
  );

  const currentWord = useReduxSelector((state) => state.word.currentWord);
  const allTopics = useReduxSelector((state) => state.word.topics);

  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);
  const [verbs, setVerbs] = useState<{ type: string; text: string }[]>([]);
  const [pronunciations, setPronunciations] = useState<
    Pronunciation[] | undefined
  >([]);
  const [definitions, setDefinitions] = useState<Definition[] | undefined>([]);
  const [newSynonym, setNewSynonym] = useState<string>("");
  const [newAntonym, setNewAntonym] = useState<string>("");
  const [newVerb, setNewVerb] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [newPronunciation, setNewPronunciation] = useState<
    Pronunciation & { audio: File | null }
  >({
    _id: generateId(),
    pos: "",
    lang: "",
    url: "",
    pron: "",
    audio: null,
  });
  const [newDefinition, setNewDefinition] = useState<Definition>({
    _id: generateId(),
    pos: "",
    source: "",
    text: "",
    translation: "",
    contextualMeaning: "",
    example: [],
  });
  const [newExample, setNewExample] = useState<Example>({
    _id: generateId(),
    text: "",
    translation: "",
  });

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const langs = useRef(["us", "uk"]);

  const [formSt] = useForm();

  const handleCloseModal = () => {
    resetCurrentWord();
    closeActionWordModal();
    formSt.resetFields();
    setNewAntonym("");
    setNewSynonym("");
    setNewVerb({ type: "", text: "" });
  };

  const handleAddSynonym = () => {
    if (newSynonym && !synonyms.includes(newSynonym)) {
      setSynonyms((prev) => [...prev, newSynonym]);
      setNewSynonym("");
    }
  };

  const handleDeleteSynonym = (synonym: string) => {
    setSynonyms((prev) => prev.filter((item) => item !== synonym));
  };

  const handleAddAntonym = () => {
    if (newAntonym && !antonyms.includes(newAntonym)) {
      setAntonyms((prev) => [...prev, newAntonym]);
      setNewAntonym("");
    }
  };

  const handleDeleteAntonym = (antonym: string) => {
    setAntonyms((prev) => prev.filter((item) => item !== antonym));
  };

  const handleAddVerb = () => {
    const types = verbs.map((verb) => verb.type.toLowerCase());
    if (newVerb && !types.includes(newVerb.type.toLowerCase())) {
      setVerbs((prev) => [...prev, newVerb]);
      setNewVerb({ type: "", text: "" });
    }
  };

  const handleDeleteVerb = (verb: string) => {
    const type = verb.split(":")[0];
    setVerbs((prev) => prev.filter((item) => item.type !== type));
  };

  const handleDeletePron = async (pid: string, urlId: string) => {
    if (currentWord && currentWord.pronunciation && pid) {
      const { data: response, status } =
        await WordService.deleteWordPronunciation(currentWord._id, pid, urlId);

      if (status === 200) {
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );
        emitter.emit(EventEmit.UpdateVocab, response.data.word);
        setPronunciations((prev) => prev?.filter((pron) => pron._id !== pid));
      }
    }
  };

  const handleRemovePronTemp = (pid: string) => {
    setPronunciations((prev) => prev?.filter((pron) => pron._id !== pid));
  };

  const handleRemoveDefTemp = (defId: string) => {
    setDefinitions((prev) =>
      prev?.filter((definition) => definition._id !== defId)
    );
  };

  const handleUpdatePronunciation = async () => {
    setConfirmLoading(true);
    const formData = new FormData();
    formData.append("audio", newPronunciation.audio!);
    let omitFields: string[] = ["audio"];
    if (newPronunciation._id.includes("new"))
      omitFields = [...omitFields, "_id", "url", "urlId"];
    formData.append(
      "pronunciation",
      JSON.stringify(_.omit(newPronunciation, omitFields))
    );
    const { data: response, status } =
      await WordService.updateWordPronunciation(currentWord!._id, formData);

    if (status === 200) {
      setPronunciations(response.data.word.pronunciation);
      emitter.emit(EventEmit.UpdateVocab, response.data.word);
      dispatch(setCurrentWord(response.data.word));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      setNewPronunciation((prev) => ({
        ...prev,
        _id: generateId(),
        lang: "",
        url: "",
        pos: "",
        pron: "",
      }));
    }

    setConfirmLoading(false);
  };

  const handleUpdateDefinition = async () => {
    setConfirmLoading(true);
    let omitFields: string[] = [];
    if (newDefinition._id.includes("new")) omitFields = [...omitFields, "_id"];
    const { data: response, status } = await WordService.updateWordDefinition(
      currentWord!._id,
      omit(newDefinition, omitFields)
    );

    if (status === 200) {
      setDefinitions(response.data.word.definition);
      emitter.emit(EventEmit.UpdateVocab, response.data.word);
      dispatch(setCurrentWord(response.data.word));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      setNewDefinition({
        _id: generateId(),
        pos: "",
        source: "",
        text: "",
        translation: "",
        contextualMeaning: "",
        example: [],
      });
    }
    setConfirmLoading(false);
  };

  const handleUpdateDefinitionExamples = async (
    selectedDefinition: Definition
  ) => {
    setConfirmLoading(true);
    const { data: response, status } = await WordService.updateWordDefinition(
      currentWord!._id,
      {
        _id: selectedDefinition._id,
        example: selectedDefinition.example.map((example) =>
          example._id.includes("new") ? omit(example, ["_id"]) : example
        ) as Example[],
      }
    );

    if (status === 200) {
      setDefinitions(response.data.word.definition);
      emitter.emit(EventEmit.UpdateVocab, response.data.word);
      dispatch(setCurrentWord(response.data.word));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    setConfirmLoading(false);
  };

  const handleDeleteDefinition = async (defId: string) => {
    setConfirmLoading(true);
    const { data: response, status } = await WordService.deleteWordDefinition(
      currentWord!._id,
      defId
    );

    if (status === 200) {
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      emitter.emit(EventEmit.UpdateVocab, response.data.word);
      setDefinitions((prev) =>
        prev?.filter((definition) => definition._id !== defId)
      );
    }
    setConfirmLoading(false);
  };

  const handleRegainPron = (pid: string) => {
    const removedPronunciation = currentWord?.pronunciation.find(
      (pron) => pron._id === pid
    );

    if (removedPronunciation) {
      setPronunciations((prev) =>
        prev ? [...prev, removedPronunciation] : [removedPronunciation]
      );
    }
  };

  const handleRegainDef = (defId: string) => {
    const removedDefinition = currentWord?.definition.find(
      (def) => def._id === defId
    );

    if (removedDefinition) {
      setDefinitions((prev) =>
        prev ? [...prev, removedDefinition] : [removedDefinition]
      );
    }
  };

  const handleResetNewExample = () => {
    setNewExample((prev) => ({
      ...prev,
      _id: generateId(),
      text: "",
      translation: "",
    }));
  };

  const handleUploadImage = async (
    options: UploadRequestOption,
    afterUpload: () => void
  ) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("file", file as Blob);
    const { data: response, status } = await WordService.updateWordImage(
      currentWord!._id,
      currentWord?.imageId,
      formData
    );

    if (status < 400) {
      const newCurrentWord: Word = {
        ...currentWord!,
        image: response.data.image,
        imageId: response.data.imageId,
      };
      emitter.emit(EventEmit.UpdateVocab, newCurrentWord);
      dispatch(setCurrentWord(newCurrentWord));

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterUpload();
  };

  const handleDeleteImage = async (afterDelete: () => void) => {
    const { data: response, status } = await WordService.deleteWordImage(
      currentWord!._id,
      currentWord!.imageId!
    );
    if (status < 400) {
      const newCurrentWord: Word = {
        ...currentWord!,
        image: null,
        imageId: null,
      };
      emitter.emit(EventEmit.UpdateVocab, newCurrentWord);
      dispatch(setCurrentWord(newCurrentWord));

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterDelete();
  };

  const handleSubmitForm = async () => {
    const wordInfo = await formSt.validateFields();
    setConfirmLoading(true);
    if (currentWord?._id.includes("new")) {
      const { data: response, status } = await WordService.createNewWord(
        _.omit(
          {
            ...wordInfo,
            antonyms,
            synonyms,
            verbs,
            baseWord: wordInfo.baseWord || null,
          },
          ["imageId"]
        ) as Word
      );

      if (status < 400) {
        emitter.emit(EventEmit.UpdateVocab, response.data.words[0]);
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );

        closeActionWordModal();
      }
    } else {
      _.merge(wordInfo, {
        baseWord: wordInfo.baseWord || null,
        topics: wordInfo.topics.map(
          (topic: string) =>
            allTopics.find(
              (item) => item._id === topic || item.topic === topic
            )!._id
        ),
      });
      const { data: response, status } = await WordService.updateWord(
        _.omit(
          { ...wordInfo, antonyms, synonyms, verbs, _id: currentWord?._id },
          ["imageId"]
        ) as Word
      );

      if (status < 400) {
        emitter.emit(EventEmit.UpdateVocab, response.data.word);
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );

        closeActionWordModal();
      }
    }

    setConfirmLoading(false);
  };

  const loadWords = async (q: string): Promise<Option[]> => {
    return WordService.searchWords(q).then(({ data: response }) =>
      response.data.words.map((word: Word) => ({
        value: word._id,
        label: word.word,
      }))
    ) as Promise<Option[]>;
  };

  // Init Modal
  useEffect(() => {
    formSt.setFieldsValue({
      word: currentWord?.word || "",
      baseWord: currentWord?.baseWord?.word,
      variation: currentWord?.variation,
      translation: currentWord?.translation || "",
      pos: currentWord?.pos?.map((partOfSpeech) => partOfSpeech),
      imageId: currentWord?.imageId,
      topics: currentWord?.topics
        ? currentWord?.topics.map((item) =>
            typeof item === "string" ? item : item.topic
          )
        : [],
    });

    setSynonyms(currentWord?.synonyms || []);
    setAntonyms(currentWord?.antonyms || []);
    setVerbs(
      currentWord?.verbs?.map((verb) => ({
        type: verb.type,
        text: verb.text,
      })) || []
    );
    setPronunciations(currentWord?.pronunciation);
    setDefinitions(currentWord?.definition);
    setNewPronunciation({
      _id: generateId(),
      lang: "",
      url: "",
      pos: "",
      pron: "",
      audio: null,
    });

    setNewDefinition({
      _id: generateId(),
      pos: "",
      source: "",
      text: "",
      translation: "",
      contextualMeaning: "",
      example: [],
    });
  }, [currentWord, formSt]);

  return (
    <Modal
      open={modalStatus}
      centered
      loading={!currentWord?._id}
      maskClosable={false}
      onCancel={handleCloseModal}
      style={{
        minWidth: "848px",
      }}
      title={
        <span className="txt---600-16-20-bold">
          <FormattedMessage
            id={`words-management.${
              currentWord?._id.includes("new")
                ? "add-new-word"
                : !currentWord || currentWord["isToday" as keyof Word]
                ? "today-word"
                : "update-word"
            }`}
          />
        </span>
      }
      okText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage
            id={`common.${
              !currentWord?._id?.includes("new") ? "update" : "add"
            }`}
          />
        </span>
      }
      cancelText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage id="common.cancel" />
        </span>
      }
      onOk={handleSubmitForm}
      confirmLoading={confirmLoading}
    >
      <div className={styles.wordInfoDetailContainer}>
        <div className={styles.wordImageContainer}>
          {/* <Avatar
            shape="square"
            size={146}
            src={currentWord?.image}
            icon={currentWord?.image ? null : <TbAbc />}
          /> */}
          <UploadImage
            src={currentWord?.image}
            obj={currentWord}
            // imageShape="square"
            handleUploadImage={handleUploadImage}
            handleDeleteImage={handleDeleteImage}
          />
        </div>

        <div className={styles.impotantDetaiInfoContainer}>
          <Form
            form={formSt}
            layout="vertical"
            variant="filled"
            size="large"
            requiredMark="optional"
            labelCol={{
              style: { paddingBottom: 0 },
            }}
          >
            <Row gutter={[12, 0]}>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.word" />
                    </span>
                  }
                  name="word"
                  required
                  rules={[{ required: true, message: "Please enter a word!" }]}
                  tooltip="This is a required field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Enter a word"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.translation" />
                    </span>
                  }
                  name="translation"
                  required
                  rules={[{ required: true, message: "Please enter a trans!" }]}
                  tooltip="This is a required field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Enter a translation"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.pos" />
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please enter at least one part of speech!",
                    },
                  ]}
                  name="pos"
                  tooltip="This is a optional field"
                >
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Select part of speechs"
                    onChange={() => {}}
                    options={partOfSpeeches.map((pos) => ({
                      key: pos,
                      value: pos,
                      label: capitalize(pos),
                    }))}
                    size="middle"
                    className="txt---400-14-18-regular"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.base-word" />
                    </span>
                  }
                  name="baseWord"
                  tooltip="This is a optional field"
                >
                  <DebounceSelect
                    mode="multiple"
                    maxCount={1}
                    size="middle"
                    fetchOptions={loadWords}
                    debounceTimeout={800}
                    value={formSt.getFieldValue("baseWord") || null}
                    onChange={(value: Option[]) => {
                      formSt.setFieldValue(
                        "baseWord",
                        value.map((item) => ({
                          value: item.value,
                          label: item.label,
                        }))[0]?.value
                      );
                      reloadUI();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.image-id" />
                    </span>
                  }
                  name="imageId"
                >
                  <Input disabled size="middle" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.topic" />
                    </span>
                  }
                  name="topics"
                  required
                  rules={[
                    {
                      required: true,
                      message: "Please enter at least one topic!",
                    },
                  ]}
                  tooltip="This is a require field"
                >
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Select topics"
                    onChange={() => {}}
                    options={allTopics?.map((item) => ({
                      value: item._id,
                      label: item.topic,
                    }))}
                    size="middle"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.variation" />
                    </span>
                  }
                  name="variation"
                  tooltip="This is a optional field"
                >
                  <Select
                    allowClear
                    placeholder="Select variation"
                    onChange={() => {}}
                    options={variations.map((variation) => ({
                      value: variation,
                      label: capitalize(variation),
                    }))}
                    size="middle"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      <div className={styles.extraDetaiInfoContainer}>
        <Row gutter={[12, 24]}>
          <Col span={12}>
            <div className={styles.synonymsContainer}>
              <span className={clsx([styles.title, "txt---600-14-22-bold"])}>
                <FormattedMessage id="common.synonyms" />
              </span>
              <div className={styles.inputContainer}>
                <Input
                  placeholder="Enter a synonym"
                  size="large"
                  className="txt---400-14-18-regular"
                  variant="filled"
                  value={newSynonym}
                  onChange={(e) => setNewSynonym(e.target.value)}
                  onPressEnter={handleAddSynonym}
                />
                <Button
                  type="primary"
                  size="middle"
                  shape="round"
                  onClick={handleAddSynonym}
                  disabled={newSynonym.trim() ? false : true}
                >
                  <div className={styles.iconAddWrapper}>
                    <AiFillPlusCircle />
                  </div>
                </Button>
              </div>
              {synonyms.length ? (
                <ListItems
                  items={synonyms}
                  handleDelete={handleDeleteSynonym}
                />
              ) : (
                <></>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.antonymsContainer}>
              <span className={clsx([styles.title, "txt---600-14-22-bold"])}>
                <FormattedMessage id="common.antonyms" />
              </span>
              <div className={styles.inputContainer}>
                <Input
                  placeholder="Enter a antonym"
                  size="large"
                  className="txt---400-14-18-regular"
                  variant="filled"
                  value={newAntonym}
                  onChange={(e) => setNewAntonym(e.target.value)}
                  onPressEnter={handleAddAntonym}
                />
                <Button
                  type="primary"
                  size="middle"
                  shape="round"
                  onClick={handleAddAntonym}
                  disabled={newAntonym.trim() ? false : true}
                >
                  <div className={styles.iconAddWrapper}>
                    <AiFillPlusCircle />
                  </div>
                </Button>
              </div>
              {antonyms.length ? (
                <ListItems
                  items={antonyms}
                  handleDelete={handleDeleteAntonym}
                />
              ) : (
                <></>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.verbsContainer}>
              <span className={clsx([styles.title, "txt---600-14-22-bold"])}>
                <FormattedMessage id="common.verbs" />
              </span>
              <div className={styles.inputContainer}>
                <Input
                  placeholder="Enter a type"
                  size="large"
                  className="txt---400-14-18-regular"
                  variant="filled"
                  value={newVerb.type}
                  onChange={(e) =>
                    setNewVerb((prev) => ({ ...prev, type: e.target.value }))
                  }
                />
                <Input
                  placeholder="Enter a text"
                  size="large"
                  className="txt---400-14-18-regular"
                  variant="filled"
                  value={newVerb.text}
                  onChange={(e) =>
                    setNewVerb((prev) => ({ ...prev, text: e.target.value }))
                  }
                />
                <Button
                  type="primary"
                  size="middle"
                  shape="round"
                  onClick={handleAddVerb}
                  disabled={
                    newVerb.text.trim() && newVerb.type.trim() ? false : true
                  }
                >
                  <div className={styles.iconAddWrapper}>
                    <AiFillPlusCircle />
                  </div>
                </Button>
              </div>
              {verbs.length ? (
                <ListItems
                  items={verbs.map((verb) => `${verb.type}: ${verb.text}`)}
                  handleDelete={handleDeleteVerb}
                />
              ) : (
                <></>
              )}
            </div>
          </Col>
          {currentWord && !currentWord._id?.includes("new") && (
            <>
              <Col span={24}>
                <Pronunciations
                  langs={langs}
                  partOfSpeeches={partOfSpeeches}
                  handleDeletePron={handleDeletePron}
                  pronunciations={pronunciations}
                  confirmLoading={confirmLoading}
                  newPronunciation={newPronunciation}
                  setNewPronunciation={setNewPronunciation}
                  handleUpdatePronunciation={handleUpdatePronunciation}
                  handleRegainPron={handleRegainPron}
                  handleRemoveTemp={handleRemovePronTemp}
                />
              </Col>
              <Col span={24}>
                <Definitions
                  newDefinition={newDefinition}
                  setNewDefinition={setNewDefinition}
                  newExample={newExample}
                  setNewExample={setNewExample}
                  partOfSpeeches={partOfSpeeches}
                  definitions={definitions}
                  confirmLoading={confirmLoading}
                  handleResetNewExample={handleResetNewExample}
                  handleUpdateDefinition={handleUpdateDefinition}
                  handleDeleteDefinition={handleDeleteDefinition}
                  handleRemoveTemp={handleRemoveDefTemp}
                  handleRegainDef={handleRegainDef}
                  handleUpdateDefinitionExamples={
                    handleUpdateDefinitionExamples
                  }
                />
              </Col>
            </>
          )}
        </Row>
      </div>
    </Modal>
  );
};

type DeleteItemFunc = (item: string) => void;

const ListItems = ({
  items,
  handleDelete,
}: {
  items: string[];
  handleDelete: DeleteItemFunc;
}) => {
  return (
    <div className={styles.listItemsContainer}>
      <Row gutter={[8, 8]}>
        {items.map((item) => (
          <Col key={item}>
            <div
              className={clsx([
                styles.detailItemContainer,
                "txt---400-14-18-regular",
              ])}
            >
              {item}
              <button
                className={styles.btnDelete}
                onClick={() => handleDelete(item)}
              >
                <ImCancelCircle />
              </button>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActionWordModal;
