import styled, { css } from "styled-components";
import { useState, useEffect } from "react";
import CheckIconGreen from "../../assets/images/icons/icon_check_gr.png";
import { useMutation } from "@tanstack/react-query";
import { deleteFollowUser, followUser } from "../../api/userApi";
import { useRecoilState } from "recoil";
import { followedUserIds } from "../../atoms/atoms";
import ConfirmModal from "../Modals/ConfirmModal";
import { ROUTE } from "../../constant/route";

const FollowLabel = styled.button<{ isAdmin: boolean; followed: boolean }>`
  background: ${({ theme }) => theme.colors.dasidaGreen};
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ isAdmin, theme }) =>
      isAdmin ? theme.colors.white : theme.colors.dasidaGreen};

  position: relative;
  display: block;
  width: 62px;
  border-radius: 60px;
  padding: 3px 0;
  font-size: 13px;
  text-align: center;
  cursor: pointer;

  & + input[type="checkbox"] {
    display: none;
    visibility: hidden;
  }

  &:before {
    display: none;
    content: "";
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translate(0, -50%);
    width: 0.9em;
    height: 0.9em;
    background: url(${CheckIconGreen}) no-repeat 50% 50% / contain;
    transition: all 0.3s;
  }

  ${({ followed, theme, isAdmin }) =>
    followed &&
    css`
      color: ${theme.colors.dasidaGreen};
      background: ${isAdmin ? theme.colors.white : "transparent"};
      padding: 3px 0 3px 14px;
      &::before {
        display: block;
      }
    `}
  transition: all 0.3s;
`;

interface FollowToggleSmallType {
  isAdmin: boolean;
  followed: boolean;
  userId?: number;
}

export default function FollowToggleSmall({
  isAdmin,
  userId,
}: FollowToggleSmallType) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [followUserId, setFollowUserId] = useRecoilState(followedUserIds);
  const [showModal, setShowModal] = useState<boolean>(false);
  const isToken = sessionStorage.getItem("jwtToken");

  const createFollow = useMutation(() => followUser(userId!), {
    onSuccess: () => {
      setIsFollowed(true);
      setFollowUserId((prev) => [...prev, userId!]);
    },
  });
  const deleteFollow = useMutation(() => deleteFollowUser(userId!), {
    onSuccess: () => {
      setIsFollowed(false);
      setFollowUserId((prev) => prev.filter((id) => id !== userId!));
    },
  });

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isToken) {
      if (isFollowed) {
        deleteFollow.mutate();
      } else {
        createFollow.mutate();
      }
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (followUserId.find((el) => el === userId!) !== undefined)
      setIsFollowed(true);
    else setIsFollowed(false);
  }, [followUserId, userId]);

  return (
    <div>
      <FollowLabel
        isAdmin={isAdmin}
        followed={isFollowed}
        onClick={handleOnClick}>
        팔로우
      </FollowLabel>
      <ConfirmModal
        showModal={showModal}
        setShowModal={setShowModal}
        returnPath={ROUTE.FEED_LIST.link}
      />
    </div>
  );
}

FollowToggleSmall.defaultProps = {
  isAdmin: false,
  followed: false,
};
