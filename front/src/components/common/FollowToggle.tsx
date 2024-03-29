import styled from "styled-components";
import { useState, ChangeEvent, useEffect } from "react";
import CheckIconGreen from "../../assets/images/icons/icon_check_gr.png";
import CheckIconWhite from "../../assets/images/icons/icon_check_wh.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFollowUser, followUser } from "../../api/userApi";
import { useLocation, useParams } from "react-router-dom";
import ConfirmModal from "../Modals/ConfirmModal";

// const FollowLabel = styled.label<{ checked: boolean }>`
// background: ${({ checked }) => checked ? "transparent" : "#004D49"};
// color: ${({ checked }) => checked ? "#004D49" : "#FFFFFF"};
// border: 1px solid ${({ theme }) => theme.colors.dasidaGreen};
// padding: ${({ checked }) => checked ? "12px 30px 12px 55px" : "12px 30px"};

const FollowLabel = styled.label`
  background: ${({ theme }) => theme.colors.dasidaGreen};
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.dasidaGreen};

  position: relative;
  display: block;
  width: 160px;
  padding: 12px 30px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s 0.2s;

  & + input[type="checkbox"] {
    display: none;
    visibility: hidden;
  }

  &:before {
    opacity: 0;
    content: "";
    position: absolute;
    top: 50%;
    left: 35px;
    transform: translate(0, -50%);
    width: 1.1em;
    height: 1.1em;
    background: url(${CheckIconGreen}) no-repeat 50% 50% / contain;
    transition: all 0.3s;
  }

  &:hover {
    padding: 12px 30px 12px 55px;
  }

  &:hover:before {
    opacity: 1;
    background-image: url(${CheckIconWhite});
    transition: all 0.4s 0.2s;
  }

  &.active {
    color: ${({ theme }) => theme.colors.dasidaGreen};
    background: transparent;
    padding: 12px 30px 12px 55px;
  }

  &.active:before {
    opacity: 1;
    background-image: url(${CheckIconGreen});
  }

  &.active:hover:before {
    background-image: url(${CheckIconGreen});
  }
`;

interface FollowToggleProps {
  followed: boolean;
  userId: number;
}

export default function FollowToggle({ followed, userId }: FollowToggleProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { pathname } = useLocation();
  const isToken = sessionStorage.getItem("jwtToken");

  const createFollow = useMutation(() => followUser(userId!), {
    onSuccess: () => queryClient.invalidateQueries(["userProfile", id]),
  });
  const deleteFollow = useMutation(() => deleteFollowUser(userId!), {
    onSuccess: () => queryClient.invalidateQueries(["userProfile", id]),
  });

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    if (isToken) {
      if (createFollow.isLoading || deleteFollow.isLoading) return;
      if (isFollowed) {
        setIsFollowed(false);
        deleteFollow.mutate();
      } else {
        setIsFollowed(true);
        createFollow.mutate();
      }
    } else {
      setShowModal(true);
    }
  }

  useEffect(() => {
    setIsFollowed(followed);
  }, [setIsFollowed, followed]);

  return (
    <div>
      <ConfirmModal
        showModal={showModal}
        setShowModal={setShowModal}
        returnPath={pathname}
      />
      <FollowLabel
        htmlFor="followToggle"
        className={isFollowed ? "active" : ""}>
        팔로우
      </FollowLabel>
      <input
        id="followToggle"
        type="checkbox"
        checked={isFollowed}
        onChange={handleOnChange}
      />
    </div>
  );
}

FollowToggle.defaultProps = {
  followed: false,
  userId: undefined,
};
