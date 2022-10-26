import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getFeedList, getFeedListAuthorized } from "../../api/feedApi";
import {
  Container,
  Container1300,
  PageTitle,
  PageWrap,
} from "../../components/common/Containers";
import FeedAddButton from "../../components/Feed/FeedAddButton";
import FeedList from "../../components/Feed/FeedList";
import FeedCategoryFilter from "../../components/Feed/FeedCategoryFilter";
import { useEffect, useState } from "react";
import { FEEDS } from "../../constant/queryKeys";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { followedUserIds, loggedInUserId } from "../../atoms/atoms";

interface CategoryState {
  [key: string]: boolean;
}

const initialState: CategoryState = {
  전체: true,
  플라스틱: false,
  섬유: false,
  나무: false,
  종이: false,
  유리: false,
  금속: false,
  고무: false,
  "그 외": false,
};

function FeedListPage() {
  const isToken = sessionStorage.getItem("jwtToken");
  const currentUserId = useRecoilValue(loggedInUserId);
  const setFollowedUsers = useSetRecoilState(followedUserIds);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryState>(initialState);

  const { isSuccess, data } = useQuery(
    [FEEDS, selectedCategory],
    currentUserId && isToken ? getFeedListAuthorized : getFeedList,
    {
      onSuccess: (data) => {
        if (isToken) {
          setFollowedUsers([]);
          data.forEach(
            ({ userId, followed }) =>
              followed &&
              setFollowedUsers((prev) => {
                if (prev.filter((id) => id !== userId))
                  return [...prev, userId];
                return [...prev];
              })
          );
        }
      },
    }
  );

  const handleCategoryButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const eventValue = (event.target as HTMLButtonElement).value;
    if (eventValue !== "전체")
      setSelectedCategory((prev) => ({
        ...prev,
        [eventValue]: !selectedCategory[eventValue],
        전체: false,
      }));
    else setSelectedCategory(initialState);
  };

  useEffect(() => {
    if (
      !Object.values(selectedCategory).includes(true) ||
      Object.values(selectedCategory).filter((el) => el).length === 8
    )
      setSelectedCategory(initialState);
  }, [selectedCategory, data]);

  return (
    <PageWrap>
      <PageTitle>다시, 다 사용하다</PageTitle>
      <Container>
        <Container1300>
          <FeedListOptionsContainer>
            <FeedCategoryFilter
              onClick={handleCategoryButtonClick}
              selectedCategory={selectedCategory}
            />
            {isToken && <FeedAddButton />}
          </FeedListOptionsContainer>

          <FeedListContainer>
            {isSuccess && (
              <FeedList
                feeds={data.filter(({ category }) => {
                  const selectedList: string[] = [];
                  Object.keys(selectedCategory).forEach(
                    (key) => selectedCategory[key] && selectedList.push(key)
                  );
                  if (selectedList.includes("전체")) return true;
                  const diff = category
                    .split(",")
                    .filter((toFind) => selectedList.includes(toFind));
                  if (diff.length) return true;
                  return false;
                })}
                isSimple={false}
              />
            )}
          </FeedListContainer>
        </Container1300>
      </Container>
    </PageWrap>
  );
}

const FeedListOptionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeedListContainer = styled.div`
  width: 100%;
  min-height: 900px;
`;

export default FeedListPage;
